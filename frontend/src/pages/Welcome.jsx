import { useEffect, useState } from "react";
import { getUser, logout } from "../api/api";
import { useNavigate, Link } from "react-router-dom";

const Welcome = () => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);

      const user = await getUser();
      console.log("Utilisateur récupéré :", user);

      if (user) {
        if (user.wallet_address) {
          setUsername(user.username || `Wallet: ${user.wallet_address.substring(0, 6)}...`);
        } else {
          setUsername(user.username || user.email || "Utilisateur");
        }
      } else {
        const storedWallet = localStorage.getItem("walletAddress");
        if (storedWallet) {
          setUsername(`Wallet: ${storedWallet.substring(0, 6)}...`);
        } else {
          navigate("/login");
        }
      }

      setLoading(false);
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem("walletAddress");
    navigate("/login");
  };

  return (
    <div className="h-screen bg-gray-900 text-white">
      {/* Navbar */}
      <nav className="bg-gray-800 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">LegiChain</h1>
        <div className="flex items-center space-x-4">
          <span className="text-gray-300">{username}</span>
          <Link to="/profile" className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg">Profil</Link>
          <button 
            onClick={handleLogout} 
            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg">
            Déconnexion
          </button>
        </div>
      </nav>

      {/* Contenu principal */}
      <div className="flex flex-col items-center justify-center h-full text-center">
        {loading ? (
          <h1 className="text-3xl font-bold">Chargement...</h1>
        ) : (
          <h1 className="text-4xl font-extrabold">
            🎉 Bienvenue sur LegiChain, {username} !
          </h1>
        )}
      </div>
    </div>
  );
};

export default Welcome;
