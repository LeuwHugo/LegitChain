import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, TrendingUp, CheckCircle, XCircle, Award, Wallet, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useVerification } from '../contexts/VerificationContext';
import { useWeb3 } from '../contexts/Web3Context';

const DashboardPage: React.FC = () => {
  const { user, profile } = useAuth();
  const { getUserVerifications } = useVerification();
  const { walletAddress, getTokenBalance } = useWeb3();
  
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tokenBalance, setTokenBalance] = useState('0');
  const [stats, setStats] = useState({
    totalVerifications: 0,
    authenticCount: 0,
    fakeCount: 0,
    averageConfidence: 0,
    recentVerifications: [] as any[],
    earnedTokens: 0
  });

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        const verificationData = await getUserVerifications();
        setVerifications(verificationData);
        
        // Calculate stats
        const totalVerifications = verificationData.length;
        const authenticCount = verificationData.filter(v => v.is_authentic).length;
        const fakeCount = totalVerifications - authenticCount;
        const totalConfidence = verificationData.reduce((sum, v) => sum + v.confidence, 0);
        const averageConfidence = totalVerifications > 0 ? 
          Math.round(totalConfidence / totalVerifications) : 0;
        const recentVerifications = verificationData.slice(0, 5);
        
        setStats({
          totalVerifications,
          authenticCount,
          fakeCount,
          averageConfidence,
          recentVerifications,
          earnedTokens: profile?.tokens_balance || 0
        });
        
        // Get token balance from web3 if wallet is connected
        if (walletAddress) {
          const balance = await getTokenBalance();
          setTokenBalance(balance);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user, profile, walletAddress]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
          <p className="mb-6">Please log in to view your dashboard.</p>
          <Link to="/login" className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg">
            Log In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Your Dashboard</h1>
        <p className="text-gray-600">
          Track your verification activity, reputation, and token earnings
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Verifications</p>
              <h3 className="text-3xl font-bold">{stats.totalVerifications}</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              12%
            </span>
            <span className="text-gray-500 ml-2">vs. last month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Tokens Earned</p>
              <h3 className="text-3xl font-bold">{stats.earnedTokens}</h3>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Wallet className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              8%
            </span>
            <span className="text-gray-500 ml-2">vs. last month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Avg. Confidence</p>
              <h3 className="text-3xl font-bold">{stats.averageConfidence}%</h3>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              3%
            </span>
            <span className="text-gray-500 ml-2">vs. last month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Reputation</p>
              <h3 className="text-3xl font-bold">{profile?.reputation || 0}</h3>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              5%
            </span>
            <span className="text-gray-500 ml-2">vs. last month</span>
          </div>
        </div>
      </div>

      {/* Authentication Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-1">
          <h3 className="text-lg font-bold mb-4">Authentication Breakdown</h3>
          
          <div className="mb-6">
            <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${stats.totalVerifications ? (stats.authenticCount / stats.totalVerifications) * 100 : 0}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <div>
                <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>
                <span>Authentic ({stats.authenticCount})</span>
              </div>
              <div>
                <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1"></span>
                <span>Fake ({stats.fakeCount})</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Authentic Rate</p>
              <p className="text-xl font-bold text-green-700">
                {stats.totalVerifications ? 
                  Math.round((stats.authenticCount / stats.totalVerifications) * 100) : 0}%
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Fake Rate</p>
              <p className="text-xl font-bold text-red-700">
                {stats.totalVerifications ? 
                  Math.round((stats.fakeCount / stats.totalVerifications) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Recent Verifications</h3>
            <Link to="/profile" className="text-purple-600 text-sm flex items-center hover:text-purple-800">
              View all <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          {stats.recentVerifications.length > 0 ? (
            <div className="space-y-4">
              {stats.recentVerifications.map((verification) => (
                <div key={verification.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${verification.is_authentic ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {verification.is_authentic ? 
                      <CheckCircle className="h-5 w-5" /> : 
                      <XCircle className="h-5 w-5" />
                    }
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="font-medium">
                      {verification.brand} {verification.model}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(verification.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${verification.is_authentic ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {verification.is_authentic ? 'Authentic' : 'Fake'}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {verification.confidence}% confidence
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No verifications yet</p>
              <Link 
                to="/verify" 
                className="mt-4 inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Verify a Product
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Wallet & Earnings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold mb-4">Token Wallet</h3>
          
          {walletAddress ? (
            <div>
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white mb-6">
                <p className="text-sm opacity-80 mb-1">Current Balance</p>
                <h4 className="text-3xl font-bold mb-4">{tokenBalance} LGIT</h4>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm opacity-80 mb-1">Wallet Address</p>
                    <p className="font-mono text-sm">{`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 bg-white/20 rounded-lg text-sm backdrop-blur-sm hover:bg-white/30">
                      Stake
                    </button>
                    <button className="px-4 py-2 bg-white/20 rounded-lg text-sm backdrop-blur-sm hover:bg-white/30">
                      Transfer
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Token Transactions</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium">Verification Reward</p>
                        <p className="text-sm text-gray-500">Yesterday</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">+5 LGIT</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium">Verification Reward</p>
                        <p className="text-sm text-gray-500">3 days ago</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">+8 LGIT</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <Wallet className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium">Staking</p>
                        <p className="text-sm text-gray-500">4 days ago</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-purple-600">-10 LGIT</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Connect your wallet to manage your tokens</p>
              <Link to="/profile" className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Connect Wallet
              </Link>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold mb-6">Earnings & Reputation</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total Earned</p>
              <p className="text-2xl font-bold text-purple-700">{stats.earnedTokens} LGIT</p>
            </div>
            <div className="bg-indigo-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Reputation Score</p>
              <p className="text-2xl font-bold text-indigo-700">{profile?.reputation || 0}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="font-medium mb-2">Reputation Progress</h4>
            <div className="relative pt-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-xs font-semibold inline-block text-purple-600">
                    Level {Math.floor((profile?.reputation || 0) / 100) + 1}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-purple-600">
                    {(profile?.reputation || 0) % 100}/100
                  </span>
                </div>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full"
                  style={{ width: `${(profile?.reputation || 0) % 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Unlock More Rewards</h4>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium">Verify 5 more products</h5>
                  <span className="text-sm text-purple-600">+20 LGIT</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-purple-600 rounded-full"
                    style={{ width: `${Math.min(100, (stats.totalVerifications / 5) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {stats.totalVerifications}/5 completed
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium">Reach 80% accuracy</h5>
                  <span className="text-sm text-purple-600">+50 LGIT</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-purple-600 rounded-full"
                    style={{ width: `${Math.min(100, (stats.averageConfidence / 80) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {stats.averageConfidence}% / 80% accuracy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;