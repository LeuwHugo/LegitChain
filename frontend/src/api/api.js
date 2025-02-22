//api.js

import { createClient } from "@supabase/supabase-js";
import { ethers } from "ethers";

// Initialisation de Supabase
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: { persistSession: true, autoRefreshToken: true }
  }
);

// Vérifier si l'utilisateur existe déjà en base
const checkUserExists = async (userId) => {
  const { data } = await supabase
    .from("users")
    .select("username")
    .eq("id", userId)
    .single();

  return data || null;
};

// Connexion via Google ou Twitter
export const loginWithOAuth = async (provider) => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      redirectTo: window.location.origin + "/welcome",
    }
  });

  if (error) {
    console.error("Erreur d'authentification :", error);
    return { error: error.message };
  }

  // Vérifier si l'utilisateur existe en base
  const user = await checkUserExists(data.user?.id);

  // S'il est nouveau, rediriger vers une page pour choisir un username
  if (!user) {
    return { newUser: true };
  }

  return data;
};

// Connexion avec MetaMask et gestion des utilisateurs
export const loginWithMetaMask = async () => {
  if (!window.ethereum?.isMetaMask) {
    alert("Veuillez installer MetaMask !");
    return { error: "MetaMask non détecté" };
  }

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    const address = accounts[0].toLowerCase(); // Convertir en minuscules

    console.log("Connexion avec MetaMask - Adresse normalisée :", address);

    // Vérifier si l'utilisateur existe en base
    const { data: existingUser, error } = await supabase
      .from("users")
      .select("id, username")
      .eq("wallet_address", address)
      .maybeSingle();

    if (error) {
      console.error("Erreur lors de la vérification du wallet :", error);
      return { error: error.message };
    }

    // Si l'utilisateur n'existe pas, l'ajouter manuellement dans `users`
    if (!existingUser) {
      console.log("Nouvel utilisateur détecté - Enregistrement direct dans Supabase...");

      const { data: newUser, error: insertError } = await supabase.from("users").insert([
        {
          username: null, // L'utilisateur devra choisir un nom plus tard
          provider: "metamask",
          wallet_address: address,
        },
      ]).select("id").single(); // ✅ Récupérer l'ID du nouvel utilisateur

      if (insertError) {
        console.error("Erreur lors de l'ajout dans `users` :", insertError);
        return { error: insertError.message };
      }

      console.log("Utilisateur MetaMask enregistré !");
      return { address, userId: newUser.id, newUser: true };
    }

    localStorage.setItem("walletAddress", address);
    return { address, userId: existingUser.id };
  } catch (error) {
    console.error("Erreur MetaMask :", error);
    return { error: error.message };
  }
};

export const updateUsername = async (userId, newUsername) => {
  const { error } = await supabase
    .from("users")
    .update({ username: newUsername })
    .eq("id", userId);

  if (error) {
    console.error("Erreur mise à jour username :", error);
    return { error };
  }

  return { message: "Nom d'utilisateur mis à jour !" };
};

// Inscription d'un nouvel utilisateur avec email et mot de passe
export const signup = async (email, password, username) => {
  try {
      // Création de l'utilisateur dans Supabase Auth
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) return { error: error.message };

      // Vérifier si l'utilisateur a bien été créé
      if (data.user) {
          // Ajouter l'utilisateur dans la table `users`
          const { error: userError } = await supabase.from("users").insert([
              { id: data.user.id, username, email, provider: "email" }
          ]);

          if (userError) return { error: userError.message };
      }

      return { message: "Utilisateur créé", user: data.user };
  } catch (error) {
      return { error: error.message };
  }
};
// Connexion d'un utilisateur avec email et mot de passe
export const login = async (email, password) => {
  try {
      // Connexion via Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) return { error: error.message };

      // Vérifier si l'utilisateur est enregistré dans la table `users`
      const { error: userError } = await supabase
          .from("users")
          .select("username")
          .eq("id", data.user.id)
          .single();

      if (userError) {
          return { error: "Utilisateur introuvable en base. Veuillez contacter l'administrateur." };
      }

      return { message: "Connexion réussie", user: data.user };
  } catch (error) {
      return { error: error.message };
  }
};

// Enregistrer un utilisateur dans la base après la première connexion
export const registerUser = async (userId, username = null, provider, walletAddress = null) => {
  const { data, error } = await supabase.from("users").insert([
    { id: userId, username, provider, wallet_address: walletAddress }
  ]);

  if (error) {
    console.error("Erreur d'inscription en base :", error);
    return { error: error.message };
  }

  return data;
};

// Récupérer l'utilisateur connecté et ses informations en base
export const getUser = async () => {
  const { data: userSession } = await supabase.auth.getUser();

  // Cas 1 : L'utilisateur est connecté via email/Twitter/Google
  if (userSession?.user) {
    const userId = userSession.user.id;

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("username, wallet_address")
      .eq("id", userId)
      .maybeSingle();

    if (userError) {
      console.error("Erreur récupération utilisateur :", userError);
      return null;
    }

    return {
      id: userId,
      email: userSession.user.email,
      username: userData?.username || null,
      wallet_address: userData?.wallet_address || null
    };
  }

  // Cas 2 : L'utilisateur est connecté avec MetaMask (via localStorage)
  const storedWallet = localStorage.getItem("walletAddress");
  if (storedWallet) {
    const { data: walletUser, error: walletError } = await supabase
      .from("users")
      .select("id, username, wallet_address")
      .eq("wallet_address", storedWallet)
      .maybeSingle();

    if (walletError) {
      console.error("Erreur récupération utilisateur via MetaMask :", walletError);
      return null;
    }

    return {
      id: walletUser?.id || null,
      email: null,
      username: walletUser?.username || null,
      wallet_address: walletUser?.wallet_address || storedWallet
    };
  }

  console.error("Aucune session active !");
  return null;
};


// Déconnexion
export const logout = async () => {
  await supabase.auth.signOut();
  localStorage.removeItem("walletAddress");
  console.log("Utilisateur déconnecté");
};
export default supabase;
