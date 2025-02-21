import { useEffect, useState } from "react";
import { getUser, logout } from "../api/api";
import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const [username, setUsername] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);

      // Récupérer l'utilisateur connecté
      const user = await getUser();
      console.log("Utilisateur récupéré :", user);

      if (user) {
        setUsername(user.email || "Utilisateur");
      } else {
        // Vérifier si un wallet est stocké en local (MetaMask)
        const storedWallet = localStorage.getItem("walletAddress");
        if (storedWallet) {
          setWalletAddress(storedWallet);
        } else {
          navigate("/login");
        }
      }

      setLoading(false);
    };

    fetchUser();
  }, [navigate]);

  // Déconnexion de l'utilisateur
  const handleLogout = async () => {
    await logout();
    localStorage.removeItem("walletAddress");
    navigate("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center bg-gray-900 text-white">
      {loading ? (
        <h1 className="text-3xl font-bold">Chargement...</h1>
      ) : (
        <>
          <h1 className="text-4xl font-extrabold">
            🎉 Bienvenue sur LegiChain, {walletAddress ? `Wallet: ${walletAddress}` : username} !
          </h1>
          <p className="text-lg text-gray-300 mt-2">
            Vous êtes connecté avec {walletAddress ? "MetaMask" : "un compte email/Twitter/Google"}.
          </p>
          <div className="mt-6 flex space-x-4">
            <button 
              onClick={() => navigate("/")} 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-300">
              Retour à l&apos;accueil
            </button>
            <button 
              onClick={handleLogout} 
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition duration-300">
              Déconnexion
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Welcome;
