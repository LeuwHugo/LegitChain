import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { updateUsername } from "../api/api";

const SetUsername = () => {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Récupérer l'userId depuis les paramètres de navigation
  const userId = location.state?.userId;

  useEffect(() => {
    if (!userId) {
      navigate("/login");
    }
  }, [userId, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage("");

    const response = await updateUsername(userId, username);
    if (response.error) {
      setMessage("Erreur lors de la mise à jour !");
    } else {
      setMessage("Nom d'utilisateur mis à jour !");
      setTimeout(() => {
        navigate("/welcome");
      }, 2000); // Rediriger après 2 secondes
    }
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6">Choisissez un Nom d&apos;Utilisateur</h1>
      <form onSubmit={handleUpdate} className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
        <label className="block text-sm text-gray-400 mb-1">Nom d&apos;utilisateur</label>
        <input 
          className="input w-full mb-3 bg-gray-700 text-gray-300 p-2 rounded" 
          type="text" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          required 
        />

        {message && <p className="text-green-400 text-sm">{message}</p>}

        <button className="btn btn-primary w-full mt-3" type="submit">
          Valider
        </button>
      </form>
    </div>
  );
};

export default SetUsername;
