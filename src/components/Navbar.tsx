import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Menu, X, User, LogOut, Wallet, BarChart3, ShoppingCart, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';

const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const { walletAddress, connectWallet, isConnected } = useWeb3();
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile menu when changing routes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleConnectWallet = async () => {
    await connectWallet();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Shield className="h-8 w-8 text-purple-700" />
              <span className="ml-2 text-xl font-bold text-gray-900">Legit<span className="text-purple-700">Check</span></span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:ml-8 md:flex md:space-x-8">
            <Link
              to={user ? "/dashboard" : "/"}
              className="text-gray-700 hover:text-purple-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              {user ? "Dashboard" : "Home"}
            </Link>

              <Link to="/verify" className="text-gray-700 hover:text-purple-700 px-3 py-2 rounded-md text-sm font-medium">
                Verify Product
              </Link>
              <Link to="/marketplace" className="text-gray-700 hover:text-purple-700 px-3 py-2 rounded-md text-sm font-medium">
                Marketplace
              </Link>
            </nav>
          </div>
          
          {/* Desktop Right Side */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {user ? (
              <>
                {!isConnected && (
                  <button 
                    onClick={handleConnectWallet}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet
                  </button>
                )}
                
                {isConnected && (
                  <div className="text-sm font-medium text-gray-700 bg-gray-100 rounded-full px-4 py-2 flex items-center">
                    <Wallet className="mr-2 h-4 w-4 text-green-500" />
                    {shortenAddress(walletAddress || '')}
                  </div>
                )}
                
                <Link to="/dashboard" className="text-gray-700 hover:text-purple-700 px-3 py-2 rounded-md text-sm font-medium">
                  <BarChart3 className="h-5 w-5" />
                </Link>
                
                <div className="relative group">
                  <button className="flex items-center text-gray-700 hover:text-purple-700">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700">
                      {profile?.username?.charAt(0).toUpperCase() || <User className="h-5 w-5" />}
                    </div>
                  </button>
                  
                  <div className="absolute right-0 w-48 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                    <div className="px-4 py-3">
                      <p className="text-sm">Signed in as</p>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {profile?.username || user.email}
                      </p>
                    </div>
                    <div className="py-1">
                      <Link to="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-purple-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-purple-700 focus:outline-none"
            >
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        <Link
          to={user ? "/dashboard" : "/"}
          className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-700"
        >
          {user ? "Dashboard" : "Home"}
        </Link>

          <Link to="/verify" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-700">
            Verify Product
          </Link>
          <Link to="/marketplace" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-700">
            Marketplace
          </Link>
        </div>
        
        <div className="pt-4 pb-3 border-t border-gray-200">
          {user ? (
            <div className="flex items-center px-5">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700">
                  {profile?.username?.charAt(0).toUpperCase() || <User className="h-6 w-6" />}
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{profile?.username || 'User'}</div>
                <div className="text-sm font-medium text-gray-500">{user.email}</div>
              </div>
            </div>
          ) : null}
          
          <div className="mt-3 space-y-1 px-2">
            {user ? (
              <>
                <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-700">
                  Profile
                </Link>
                <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-700">
                  Dashboard
                </Link>
                {!isConnected && (
                  <button
                    onClick={handleConnectWallet}
                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-700"
                  >
                    Connect Wallet
                  </button>
                )}
                {isConnected && (
                  <div className="px-3 py-2 text-sm font-medium text-gray-700">
                    Wallet: {shortenAddress(walletAddress || '')}
                  </div>
                )}
                <button
                  onClick={handleSignOut}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-700"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-purple-700">
                  Log in
                </Link>
                <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;