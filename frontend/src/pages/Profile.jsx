import { useEffect, useState } from "react";
import { getUser, updateUsername } from "../api/api"; 
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const currentUser = await getUser();
      
      if (currentUser) {
        setUser(currentUser);
        setUsername(currentUser.username || "");
      } else {
        navigate("/login");
      }
      
      setLoading(false);
    };

    fetchUser();
  }, [navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage("");

    const response = await updateUsername(user.id, username);
    if (response.error) {
      setMessage("Erreur lors de la mise à jour !");
    } else {
      setMessage("Nom d'utilisateur mis à jour !");
      
      // ✅ Redirection après mise à jour réussie
      setTimeout(() => {
        navigate("/welcome");
      }, 2000); // Redirige après 2 secondes
    }
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6">Profil</h1>
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <form onSubmit={handleUpdate} className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
          <label className="block text-sm text-gray-400 mb-1">Email</label>
          <input className="input w-full mb-3 bg-gray-700 text-gray-300 p-2 rounded" type="email" value={user.email} disabled />

          <label className="block text-sm text-gray-400 mb-1">Nom d&apos;utilisateur</label>
          <input 
            className="input w-full mb-3 bg-gray-700 text-gray-300 p-2 rounded" 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />

          {message && <p className="text-green-400 text-sm text-center">{message}</p>}

          <button className="btn btn-primary w-full mt-3" type="submit">
            Mettre à jour
          </button>
        </form>
      )}
    </div>
  );
};

export default Profile;
