import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, CheckCircle, XCircle, Camera, ImageIcon, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useVerification } from '../contexts/VerificationContext';
import { useWeb3 } from '../contexts/Web3Context';

interface ProductDetails {
  brand: string;
  model: string;
  category: string;
  description?: string;
  purchasePrice?: number;
  purchaseDate?: string;
  serialNumber?: string;
}

interface VerificationResult {
  isAuthentic: boolean;
  confidence: number;
  features: string[];
  suggestedPrice: number;
}

const VerifyPage: React.FC = () => {
  const { user, profile } = useAuth();
  const { isVerifying, uploadImage, verifyProduct, submitVerification } = useVerification();
  const { walletAddress, stakeTokens } = useWeb3();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [productDetails, setProductDetails] = useState<ProductDetails>({
    brand: '',
    model: '',
    category: 'sneakers',
    description: '',
    purchasePrice: undefined,
    purchaseDate: '',
    serialNumber: '',
  });
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [stakingAmount, setStakingAmount] = useState('10');
  const [staked, setStaked] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProductDetails(prev => ({
      ...prev,
      [name]: name === 'purchasePrice' ? parseFloat(value) || undefined : value
    }));
  };

  const handleStake = async () => {
    setLoading(true);
    try {
      const success = await stakeTokens(stakingAmount);
      if (success) {
        setStaked(true);
        setStep(2);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage || !productDetails.brand || !productDetails.model || !productDetails.category) {
      return;
    }

    setLoading(true);
    try {
      // Upload the image
      const uploadedUrl = await uploadImage(selectedImage, productDetails);
      if (uploadedUrl) {
        setImageUrl(uploadedUrl);
        setStep(3);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!imageUrl) return;
    
    setLoading(true);
    try {
      const result = await verifyProduct(imageUrl, productDetails);
      if (result) {
        setVerificationResult(result);
        setStep(4);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!imageUrl || !verificationResult) return;
    
    setLoading(true);
    try {
      const success = await submitVerification(imageUrl, productDetails, verificationResult);
      if (success) {
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="bg-white rounded-xl shadow-md p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Verify a Product</h1>
          <p className="text-center text-gray-600 mb-6">
            You need to be logged in to verify products.
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg"
            >
              Log In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="bg-white rounded-xl shadow-md">
        <div className="border-b border-gray-200">
          <div className="flex">
            <div className={`flex-1 py-4 text-center ${step >= 1 ? 'text-purple-700 font-medium' : 'text-gray-500'}`}>
              1. Stake Tokens
            </div>
            <div className={`flex-1 py-4 text-center ${step >= 2 ? 'text-purple-700 font-medium' : 'text-gray-500'}`}>
              2. Product Details
            </div>
            <div className={`flex-1 py-4 text-center ${step >= 3 ? 'text-purple-700 font-medium' : 'text-gray-500'}`}>
              3. Verification
            </div>
            <div className={`flex-1 py-4 text-center ${step >= 4 ? 'text-purple-700 font-medium' : 'text-gray-500'}`}>
              4. Results
            </div>
          </div>
        </div>

        <div className="p-8">
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Stake Tokens to Verify</h2>
              <p className="text-gray-600 mb-6">
                You need to stake some tokens to use the verification service. These tokens will be returned to you after the verification process, plus you'll earn additional rewards.
              </p>
              
              {!walletAddress ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-yellow-700">
                    You need to connect your wallet to stake tokens. Please connect your wallet from the profile settings.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2">
                      Stake Amount (minimum 10 tokens)
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        value={stakingAmount}
                        onChange={(e) => setStakingAmount(e.target.value)}
                        className="flex-1 rounded-l-lg border-gray-300 focus:ring-purple-500 focus:border-purple-500"
                        min="10"
                        step="1"
                      />
                      <span className="inline-flex items-center px-4 rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 text-gray-500">
                        Tokens
                      </span>
                    </div>
                  </div>
                
                  <button
                    onClick={handleStake}
                    disabled={loading || staked}
                    className={`w-full py-3 rounded-lg font-medium ${
                      staked
                        ? 'bg-green-100 text-green-700'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="animate-spin mr-2 h-5 w-5" />
                        Staking...
                      </span>
                    ) : staked ? (
                      <span className="flex items-center justify-center">
                        <CheckCircle className="mr-2 h-5 w-5" />
                        Tokens Staked
                      </span>
                    ) : (
                      'Stake Tokens'
                    )}
                  </button>
                </>
              )}
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Product Details</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="image">
                    Product Image
                  </label>
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-500 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {imagePreview ? (
                      <div className="space-y-4">
                        <img 
                          src={imagePreview} 
                          alt="Product preview" 
                          className="max-h-64 mx-auto rounded-lg"
                        />
                        <p className="text-sm text-gray-500">Click to change image</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-center">
                          <Upload className="h-12 w-12 text-gray-400" />
                        </div>
                        <p className="text-gray-700">Click to upload product image</p>
                        <p className="text-sm text-gray-500">
                          PNG, JPG or JPEG (max 10MB)
                        </p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="image"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="brand">
                      Brand *
                    </label>
                    <input
                      type="text"
                      id="brand"
                      name="brand"
                      value={productDetails.brand}
                      onChange={handleProductDetailsChange}
                      className="w-full rounded-lg border-gray-300 focus:ring-purple-500 focus:border-purple-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="model">
                      Model *
                    </label>
                    <input
                      type="text"
                      id="model"
                      name="model"
                      value={productDetails.model}
                      onChange={handleProductDetailsChange}
                      className="w-full rounded-lg border-gray-300 focus:ring-purple-500 focus:border-purple-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="category">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={productDetails.category}
                    onChange={handleProductDetailsChange}
                    className="w-full rounded-lg border-gray-300 focus:ring-purple-500 focus:border-purple-500"
                    required
                  >
                    <option value="sneakers">Sneakers</option>
                    <option value="watches">Watches</option>
                    <option value="bags">Bags & Purses</option>
                    <option value="clothing">Clothing</option>
                    <option value="jewelry">Jewelry</option>
                    <option value="electronics">Electronics</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="serialNumber">
                    Serial Number / SKU
                  </label>
                  <input
                    type="text"
                    id="serialNumber"
                    name="serialNumber"
                    value={productDetails.serialNumber}
                    onChange={handleProductDetailsChange}
                    className="w-full rounded-lg border-gray-300 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="purchasePrice">
                      Purchase Price
                    </label>
                    <input
                      type="number"
                      id="purchasePrice"
                      name="purchasePrice"
                      value={productDetails.purchasePrice || ''}
                      onChange={handleProductDetailsChange}
                      className="w-full rounded-lg border-gray-300 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="purchaseDate">
                      Purchase Date
                    </label>
                    <input
                      type="date"
                      id="purchaseDate"
                      name="purchaseDate"
                      value={productDetails.purchaseDate}
                      onChange={handleProductDetailsChange}
                      className="w-full rounded-lg border-gray-300 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="description">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={productDetails.description}
                    onChange={handleProductDetailsChange}
                    rows={3}
                    className="w-full rounded-lg border-gray-300 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleUpload}
                    disabled={!selectedImage || !productDetails.brand || !productDetails.model || loading}
                    className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <Loader2 className="animate-spin mr-2 h-5 w-5" />
                        Uploading...
                      </span>
                    ) : (
                      'Continue'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Verify Your Product</h2>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3">
                    <img
                      src={imageUrl || imagePreview || ''}
                      alt="Product"
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                  <div className="md:w-2/3">
                    <h3 className="text-xl font-semibold mb-2">{productDetails.brand} {productDetails.model}</h3>
                    <div className="text-sm text-gray-500 mb-4">Category: {productDetails.category}</div>
                    {productDetails.serialNumber && (
                      <div className="text-sm mb-2">
                        <span className="font-medium">Serial Number:</span> {productDetails.serialNumber}
                      </div>
                    )}
                    {productDetails.purchasePrice && (
                      <div className="text-sm mb-2">
                        <span className="font-medium">Purchase Price:</span> ${productDetails.purchasePrice}
                      </div>
                    )}
                    {productDetails.description && (
                      <div className="text-sm mt-4">
                        <span className="font-medium">Description:</span><br />
                        {productDetails.description}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
                <h3 className="font-medium text-purple-800 mb-2">How verification works:</h3>
                <p className="text-purple-700 text-sm mb-4">
                  Our AI will analyze your product image to determine authenticity based on characteristics like stitching, logo placement, materials, and more.
                </p>
                <div className="text-sm text-purple-700">
                  <span className="font-medium">Note:</span> The accuracy of verification depends on image quality. Make sure your images are clear and well-lit.
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleVerify}
                  disabled={loading || isVerifying}
                  className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading || isVerifying ? (
                    <span className="flex items-center">
                      <Loader2 className="animate-spin mr-2 h-5 w-5" />
                      Verifying...
                    </span>
                  ) : (
                    'Verify Now'
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 4 && verificationResult && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Verification Results</h2>
              
              <div className={`rounded-lg p-6 mb-8 ${verificationResult.isAuthentic ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center mb-4">
                  {verificationResult.isAuthentic ? (
                    <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                  ) : (
                    <XCircle className="h-8 w-8 text-red-600 mr-3" />
                  )}
                  <h3 className={`text-xl font-bold ${verificationResult.isAuthentic ? 'text-green-800' : 'text-red-800'}`}>
                    {verificationResult.isAuthentic ? 'Authentic' : 'Not Authentic'}
                  </h3>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Confidence</span>
                    <span className="text-sm font-medium text-gray-700">{verificationResult.confidence}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${verificationResult.isAuthentic ? 'bg-green-600' : 'bg-red-600'}`} 
                      style={{ width: `${verificationResult.confidence}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">Authentication Features:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {verificationResult.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {verificationResult.suggestedPrice > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Estimated Market Value:</h4>
                    <p className="text-xl font-bold">${verificationResult.suggestedPrice.toFixed(2)}</p>
                  </div>
                )}
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
                <h3 className="font-medium text-purple-800 mb-2">What happens next?</h3>
                <p className="text-purple-700 text-sm">
                  By submitting this verification, you'll receive tokens based on the verification confidence and your reputation. This product will also be added to your verified items list.
                </p>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                >
                  Start Over
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <Loader2 className="animate-spin mr-2 h-5 w-5" />
                      Submitting...
                    </span>
                  ) : (
                    'Submit & Earn Tokens'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyPage;