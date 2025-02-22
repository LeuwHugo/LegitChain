import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-5xl font-extrabold text-white mb-6 animate-fade-in">
        🔗 LegiChain
      </h1>
      <p className="text-lg text-gray-300 mb-8">
        Vérifiez, échangez et sécurisez vos objets de collection avec la technologie blockchain.
      </p>
      <div className="flex space-x-4">
        <Link to="/login" className="btn btn-primary">Se connecter</Link>
        <Link to="/signup" className="btn btn-secondary">S&apos;inscrire</Link>
      </div>
    </div>
  );
};

export default Home;