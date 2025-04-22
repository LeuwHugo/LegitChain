import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Wallet, Shield, Award, Settings, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';

const ProfilePage: React.FC = () => {
  const { user, profile, linkWallet, unlinkWallet } = useAuth();
  const { connectWallet, disconnectWallet, walletAddress } = useWeb3();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    email: user?.email || '',
  });

  const handleConnectWallet = async () => {
    setLoading(true);
    try {
      const address = await connectWallet();
      if (address) {
        await linkWallet(address);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectWallet = async () => {
    setLoading(true);
    try {
      await disconnectWallet();
      await unlinkWallet();
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-12 text-white">
            <div className="flex items-center">
              <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center text-purple-600">
                <User className="h-12 w-12" />
              </div>
              <div className="ml-6">
                <h1 className="text-3xl font-bold">{profile?.username || 'User'}</h1>
                <p className="text-purple-200">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8 py-8 bg-gray-50 border-b border-gray-200">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Reputation</p>
                  <h3 className="text-2xl font-bold">{profile?.reputation || 0}</h3>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Verifications</p>
                  <h3 className="text-2xl font-bold">{profile?.verification_count || 0}</h3>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Token Balance</p>
                  <h3 className="text-2xl font-bold">{profile?.tokens_balance || 0}</h3>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Wallet className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Profile Settings */}
          <div className="px-8 py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Profile Settings</h2>
              <button
                onClick={() => setEditMode(!editMode)}
                className="flex items-center text-sm text-purple-600 hover:text-purple-800"
              >
                <Settings className="h-4 w-4 mr-1" />
                {editMode ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      disabled={!editMode}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!editMode}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>
              </div>

              {/* Wallet Connection */}
              <div>
                <h3 className="text-lg font-medium mb-4">Wallet Connection</h3>
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  {walletAddress ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center mb-2">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          <span className="font-medium">Wallet Connected</span>
                        </div>
                        <p className="text-sm text-gray-600 font-mono">
                          {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                        </p>
                      </div>
                      <button
                        onClick={handleDisconnectWallet}
                        disabled={loading}
                        className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                      >
                        {loading ? (
                          <span className="flex items-center">
                            <Loader2 className="animate-spin h-4 w-4 mr-2" />
                            Disconnecting...
                          </span>
                        ) : (
                          'Disconnect'
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center mb-2">
                          <XCircle className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="font-medium">No Wallet Connected</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Connect your wallet to participate in verifications and earn rewards
                        </p>
                      </div>
                      <button
                        onClick={handleConnectWallet}
                        disabled={loading}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                      >
                        {loading ? (
                          <span className="flex items-center">
                            <Loader2 className="animate-spin h-4 w-4 mr-2" />
                            Connecting...
                          </span>
                        ) : (
                          'Connect Wallet'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Security Settings */}
              <div>
                <h3 className="text-lg font-medium mb-4">Security</h3>
                <div className="space-y-4">
                  <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                    <div>
                      <h4 className="font-medium">Change Password</h4>
                      <p className="text-sm text-gray-500">Update your account password</p>
                    </div>
                    <Settings className="h-5 w-5 text-gray-400" />
                  </button>
                  
                  <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                    <div>
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-500">Add an extra layer of security</p>
                    </div>
                    <Shield className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Save Changes */}
              {editMode && (
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Handle save changes
                      setEditMode(false);
                    }}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;