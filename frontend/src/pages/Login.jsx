import { useState } from "react";
import { login } from "../api/api";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    const response = await login(email, password);
    if (response.error) {
      setError(response.error);
    } else {
      navigate("/welcome");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-4 text-white">Connexion</h2>
        <form onSubmit={handleLogin}>
        <input className="input mb-3" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="input mb-3" type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button className="btn btn-primary w-full" type="submit">Se connecter</button>
        </form>
        <p className="text-gray-400 mt-4 text-center">
          Pas encore de compte ? <a href="/signup" className="text-blue-400 hover:text-blue-500">S&apos;inscrire</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
