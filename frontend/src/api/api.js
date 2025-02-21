import { createClient } from "@supabase/supabase-js";
import { ethers } from "ethers";


// Récupérer les variables d'environnement depuis Vite
const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    {
      auth: { persistSession: true, autoRefreshToken: true }
    }
  );

export const signup = async (email, password, username) => {
    try {
        const { data, error } = await supabase.auth.signUp({ email, password });

        if (error) return { error: error.message };

        // Ajouter le username dans la table users
        await supabase.from('users').insert([{ id: data.user.id, username, email }]);

        return { message: "Utilisateur créé", user: data.user };
    } catch (error) {
        return { error: error.message };
    }
};

export const login = async (email, password) => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) return { error: error.message };

        return { message: "Connexion réussie", user: data.user };
    } catch (error) {
        return { error: error.message };
    }
};

// Connexion via Google ou Twitter
export const loginWithOAuth = async (provider) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: window.location.origin + "/welcome", // Redirection après connexion
      }
    });
  
    if (error) {
      console.error("Erreur d'authentification :", error);
      return { error: error.message };
    }
  
    return data;
  };

export const getUser = async () => {
    const { data } = await supabase.auth.getUser();
    return data.user || null;
};

// Connexion avec MetaMask
export const loginWithMetaMask = async () => {
  if (!window.ethereum?.isMetaMask) {
    alert("Veuillez installer MetaMask !");
    return { error: "MetaMask non détecté" };
  }

  try {
    // Version pour ethers v5.x
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    const accounts = await provider.send("eth_requestAccounts", []);
    const address = accounts[0];

    
    localStorage.setItem("walletAddress", address);
    return { address };

  } catch (error) {
    console.error("Erreur MetaMask :", error);
    return { error: error.message };
  }
};

// Déconnexion de l'utilisateur
export const logout = async () => {
  await supabase.auth.signOut();
  localStorage.removeItem("walletAddress"); // Supprimer le wallet stocké localement
  console.log("Utilisateur déconnecté");
};

export default supabase;
