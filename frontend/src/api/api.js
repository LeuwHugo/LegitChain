import { createClient } from "@supabase/supabase-js";

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

export const getUser = async () => {
    const { data } = await supabase.auth.getUser();
    return data.user || null;
};

export default supabase;
