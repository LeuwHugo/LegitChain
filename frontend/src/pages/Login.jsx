import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, loginWithOAuth, loginWithMetaMask } from "../api/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Connexion classique (email/mot de passe)
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const response = await login(email, password);
    setLoading(false);

    if (response.error) {
      setError(response.error);
    } else {
      navigate("/welcome");
    }
  };

  // Connexion avec OAuth (Google/Twitter)
  const handleOAuthLogin = async (provider) => {
    setLoading(true);
    const response = await loginWithOAuth(provider);
    setLoading(false);

    if (!response.error) {
      navigate("/welcome");
    } else {
      setError(response.error);
    }
  };

  // Connexion avec MetaMask (Wallet Web3)
  const handleMetaMaskLogin = async () => {
    if (!window.ethereum) {
      setError("MetaMask n'est pas installé. Veuillez l'installer pour continuer.");
      return;
    }

    setLoading(true);
    const response = await loginWithMetaMask();
    setLoading(false);

    if (response.address) {
      navigate("/welcome");
    } else {
      setError(response.error || "Erreur de connexion avec MetaMask !");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-4 text-white">Connexion</h2>

        {/* Message d'erreur */}
        {error && <p className="text-red-500 text-sm text-center mb-3">{error}</p>}

        {/* Formulaire de connexion classique */}
        <form onSubmit={handleLogin}>
          <input className="input mb-3" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="input mb-3" type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button className="btn btn-primary w-full" type="submit" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div className="mt-4">
  {/* Bouton Google */}
  <button onClick={() => handleOAuthLogin("google")} className="btn btn-primary w-full mb-2 flex items-center justify-center gap-2" disabled={loading}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512" className="w-5 h-5">
      <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
    </svg>
    {loading ? "Connexion..." : "Connexion avec Google"}
  </button>

  {/* Bouton Twitter/X */}
  <button onClick={() => handleOAuthLogin("twitter")} className="btn btn-secondary w-full mb-2 flex items-center justify-center gap-2" disabled={loading}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-5 h-5">
      <path fill="currentColor" d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"/>
    </svg>
    {loading ? "Connexion..." : "Connexion avec Twitter"}
  </button>

  {/* Bouton MetaMask */}
  <button onClick={handleMetaMaskLogin} className="btn btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 212 189" className="w-5 h-5">
      <g fill="currentColor">
        <path d="M60.75 173.25L39.64 155.4l21.11-12.15v30zM151.25 173.25v-30l21.11 12.15-21.11 17.85z"/>
        <path d="M106 11.25L3 96.75l38.25 80.85L106 165l64.75 12.6L209 96.75 106 11.25zm64.75 142.5l-21.11-12.15 21.11-33.15v45.3zm-119.5-45.3l21.11 33.15-21.11 12.15v-45.3zM106 94.5l-38.25-11.25L106 45l38.25 38.25L106 94.5z"/>
      </g>
    </svg>
    {loading ? "Connexion..." : "Connexion avec MetaMask"}
  </button>
</div>

        <p className="text-gray-400 mt-4 text-center">
          Pas encore de compte ? <a href="/signup" className="text-blue-400 hover:text-blue-500">S&apos;inscrire</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
