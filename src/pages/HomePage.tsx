import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, CheckCircle, Award, Wallet } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-purple-900 to-indigo-800 text-white py-24 md:py-32">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/7621142/pexels-photo-7621142.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')] bg-cover bg-center opacity-20"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
              Verify Authenticity, Earn Rewards
            </h1>
            <p className="text-xl md:text-2xl text-purple-200 mb-10">
              Upload photos of your items and our AI will verify their authenticity. 
              Get rewarded with tokens for every verification.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/verify"
                className="px-8 py-4 bg-white text-purple-900 font-bold rounded-full text-lg hover:bg-gray-100 transition-colors shadow-lg w-full sm:w-auto"
              >
                Verify a Product
              </Link>
              <Link
                to="/marketplace"
                className="px-8 py-4 bg-purple-700 text-white font-bold rounded-full text-lg hover:bg-purple-800 transition-colors shadow-lg w-full sm:w-auto"
              >
                Explore Marketplace
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get authentic products verified and earn rewards in just a few simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-6">
                <Shield className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Upload Your Product</h3>
              <p className="text-gray-600">
                Take clear photos of your product from different angles and upload them to our platform.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-6">
                <CheckCircle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI Verification</h3>
              <p className="text-gray-600">
                Our advanced AI analyzes your photos and compares them with authentic products to verify legitimacy.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-6">
                <Award className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Get Rewards</h3>
              <p className="text-gray-600">
                Earn tokens for each verification. The more you verify, the higher your reputation and rewards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Key Features</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform offers unique features that combine AI technology with blockchain rewards
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">AI Authentication</h3>
                <p className="text-gray-600">
                  Our advanced AI models can detect even the most sophisticated counterfeits by analyzing detailed product features.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Token Rewards</h3>
                <p className="text-gray-600">
                  Earn native tokens for each verification you submit. Stakes and rewards are managed via smart contracts.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Marketplace</h3>
                <p className="text-gray-600">
                  Buy and sell verified products in our marketplace. Each verified product comes with a digital certificate of authenticity.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                  <Award className="w-5 h-5" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Reputation System</h3>
                <p className="text-gray-600">
                  Build your reputation as a trusted verifier. Higher reputation means higher rewards and more influence in the community.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-purple-700 to-indigo-700 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to verify your products?</h2>
          <p className="text-xl md:text-2xl text-purple-200 mb-10 max-w-2xl mx-auto">
            Join thousands of users who trust our platform for product verification and earn rewards in the process.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-4 bg-white text-purple-700 font-bold rounded-full text-lg hover:bg-gray-100 transition-colors shadow-lg w-full sm:w-auto"
            >
              Sign Up Now
            </Link>
            <Link
              to="/verify"
              className="px-8 py-4 bg-purple-600 text-white font-bold rounded-full text-lg border border-purple-400 hover:bg-purple-800 transition-colors shadow-lg w-full sm:w-auto"
            >
              Verify a Product
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials/Stats */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Platform Stats</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our growing community of verifiers and marketplace users
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 bg-purple-50 rounded-xl text-center">
              <div className="text-4xl font-bold text-purple-700 mb-2">10,000+</div>
              <div className="text-gray-700">Products Verified</div>
            </div>
            <div className="p-6 bg-indigo-50 rounded-xl text-center">
              <div className="text-4xl font-bold text-indigo-700 mb-2">5,000+</div>
              <div className="text-gray-700">Active Users</div>
            </div>
            <div className="p-6 bg-blue-50 rounded-xl text-center">
              <div className="text-4xl font-bold text-blue-700 mb-2">500,000</div>
              <div className="text-gray-700">Tokens Earned</div>
            </div>
            <div className="p-6 bg-green-50 rounded-xl text-center">
              <div className="text-4xl font-bold text-green-700 mb-2">98%</div>
              <div className="text-gray-700">Verification Accuracy</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;