import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Shield, User, Tag, Clock, Star, Loader2, ShoppingCart, ArrowLeft } from 'lucide-react';
import { supabase } from '../App';
import { useAuth } from '../contexts/AuthContext';

interface ProductDetail {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  accepts_crypto: boolean;
  created_at: string;
  verification: {
    id: string;
    image_url: string;
    brand: string;
    model: string;
    category: string;
    description: string;
    serial_number: string;
    is_authentic: boolean;
    confidence: number;
    features: string[];
    suggested_price: number;
  };
  seller: {
    id: string;
    username: string;
    reputation: number;
  };
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('marketplace')
          .select(`
            *,
            verification:verification_id (*),
            seller:seller_id (
              id,
              profiles:user_id (
                username, 
                reputation
              )
            )
          `)
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        if (!data) {
          setError('Product not found');
          return;
        }
        
        // Transform data
        const formattedProduct = {
          id: data.id,
          title: data.title,
          description: data.description,
          price: data.price,
          currency: data.currency,
          accepts_crypto: data.accepts_crypto,
          created_at: data.created_at,
          verification: {
            id: data.verification.id,
            image_url: data.verification.image_url,
            brand: data.verification.brand,
            model: data.verification.model,
            category: data.verification.category,
            description: data.verification.description,
            serial_number: data.verification.serial_number,
            is_authentic: data.verification.is_authentic,
            confidence: data.verification.confidence,
            features: data.verification.features,
            suggested_price: data.verification.suggested_price
          },
          seller: {
            id: data.seller.id,
            username: data.seller.profiles.username,
            reputation: data.seller.profiles.reputation
          }
        };
        
        setProduct(formattedProduct);
      } catch (err: any) {
        console.error('Error fetching product details:', err);
        setError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The requested product could not be found.'}</p>
          <Link
            to="/marketplace"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Link
        to="/marketplace"
        className="inline-flex items-center text-gray-600 hover:text-purple-600 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Marketplace
      </Link>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="relative">
            <img
              src={product.verification.image_url}
              alt={product.title}
              className="w-full h-auto object-cover"
            />
            {product.verification.is_authentic && (
              <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full flex items-center">
                <CheckCircle className="h-4 w-4 mr-1.5" />
                Verified Authentic
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="p-8">
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.title}</h1>
              <div className="flex items-center text-gray-500 mb-4">
                <Tag className="h-4 w-4 mr-1.5" />
                <span>{product.verification.brand} {product.verification.model}</span>
                <span className="mx-2">•</span>
                <span className="capitalize">{product.verification.category}</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-4">
                {product.currency} {product.price.toFixed(2)}
              </div>
              <p className="text-gray-600">{product.description}</p>
            </div>

            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Seller Information</h3>
              <div className="flex items-center">
                <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 mr-3">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium">{product.seller.username}</div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
                    <span>Reputation: {product.seller.reputation || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex flex-wrap gap-2 mb-3">
                {product.verification.is_authentic ? (
                  <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center">
                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                    Authenticated
                  </div>
                ) : (
                  <div className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center">
                    <XCircle className="h-3.5 w-3.5 mr-1" />
                    Not Authenticated
                  </div>
                )}
                <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
                  {product.verification.confidence}% Confidence
                </div>
                {product.accepts_crypto && (
                  <div className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-1 rounded-full">
                    Accepts Crypto
                  </div>
                )}
              </div>
              
              <div className="text-sm text-gray-500 flex items-center">
                <Clock className="h-4 w-4 mr-1.5" />
                Listed {new Date(product.created_at).toLocaleDateString()}
              </div>
            </div>

            <div className="mb-6">
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Buy Now
              </button>
            </div>

            {product.verification.serial_number && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Serial Number</h3>
                <div className="font-mono bg-gray-100 p-2 rounded text-sm">
                  {product.verification.serial_number}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Authentication Details */}
        <div className="border-t border-gray-200 p-8">
          <h2 className="text-xl font-bold mb-4">Authentication Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Authentication Features</h3>
              {product.verification.features && product.verification.features.length > 0 ? (
                <ul className="space-y-2">
                  {product.verification.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No authentication features recorded</p>
              )}
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Verification Certificate</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Shield className="h-8 w-8 text-purple-600 mr-2" />
                    <h4 className="text-lg font-semibold">Legit Check Certificate</h4>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    product.verification.is_authentic 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.verification.is_authentic ? 'Authentic' : 'Not Authentic'}
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Item:</span>
                    <span className="font-medium">{product.verification.brand} {product.verification.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Category:</span>
                    <span className="font-medium capitalize">{product.verification.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Confidence:</span>
                    <span className="font-medium">{product.verification.confidence}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Verification Date:</span>
                    <span className="font-medium">{new Date(product.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Certificate ID:</span>
                    <span className="font-mono text-xs">{product.verification.id.substring(0, 8)}...</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-center">
                  <button className="text-purple-600 text-sm font-medium hover:text-purple-800">
                    View Full Certificate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;