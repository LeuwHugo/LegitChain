import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

// Récupérer les variables d'environnement depuis Vite
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: { persistSession: true, autoRefreshToken: true }
  }
);


const Welcome = () => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);

      // Récupération de la session active
      const { data, error } = await supabase.auth.getSession();
      console.log("Session récupérée :", data);

      if (error || !data.session) {
        console.error("Aucune session active !");
        navigate("/login");
        return;
      }

      const userId = data.session.user.id;

      // Récupération du username dans la base de données
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("username")
        .eq("id", userId)
        .single();

      if (userError) {
        console.error("Erreur récupération username :", userError);
      } else {
        console.log("Nom d'utilisateur trouvé :", userData.username);
        setUsername(userData.username);
      }

      setLoading(false);
    };

    fetchUser();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center bg-gray-900 text-white">
      {loading ? (
        <h1 className="text-3xl font-bold">Chargement...</h1>
      ) : (
        <>
          <h1 className="text-4xl font-extrabold">
            🎉 Bienvenue sur LegiChain, {username || "utilisateur"} !
          </h1>
          <p className="text-lg text-gray-300 max-w-xl mt-4">
            Vous pouvez maintenant vérifier et sécuriser vos objets avec la blockchain.
          </p>
          <button 
            onClick={() => navigate("/")} 
            className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-300">
            Retour à l&apos;accueil
          </button>
        </>
      )}
    </div>
  );
};

export default Welcome;
