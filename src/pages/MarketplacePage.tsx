import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ShoppingBag, CheckCircle, Star, Loader2 } from 'lucide-react';
import { supabase } from '../App';

interface MarketplaceItem {
  id: string;
  title: string;
  price: number;
  currency: string;
  image_url: string;
  brand: string;
  model: string;
  category: string;
  is_authentic: boolean;
  confidence: number;
  seller: {
    username: string;
    reputation: number;
  };
}

const MarketplacePage: React.FC = () => {
  const [products, setProducts] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  
  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'sneakers', name: 'Sneakers' },
    { id: 'watches', name: 'Watches' },
    { id: 'bags', name: 'Bags & Purses' },
    { id: 'clothing', name: 'Clothing' },
    { id: 'jewelry', name: 'Jewelry' },
    { id: 'electronics', name: 'Electronics' },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        let query = supabase
        .from('marketplace')
        .select(`
          *,
          verification:verification_id (
            image_url,
            brand,
            model,
            category,
            is_authentic,
            confidence
          ),
          seller:seller_id (
            username,
            reputation
          )
        `)
        .eq('status', 'active')
        .not('verification', 'is', null); // ✅ Ajout
      
          
        if (category !== 'all') {
          query = query.eq('verification.category', category);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        // Transform data to a more convenient format
        const formattedProducts = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          price: item.price,
          currency: item.currency,
          image_url: item.verification.image_url,
          brand: item.verification.brand,
          model: item.verification.model,
          category: item.verification.category,
          is_authentic: item.verification.is_authentic,
          confidence: item.verification.confidence,
          seller: {
            username: item.seller.username,
            reputation: item.seller.reputation
          }
                  
        }));
        
        setProducts(formattedProducts);
      } catch (error) {
        console.error('Error fetching marketplace products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [category]);

  const filteredProducts = products.filter(product => 
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Marketplace</h1>
        <p className="text-gray-600">
          Browse verified authentic products from trusted sellers
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row justify-between mb-8">
        <div className="flex overflow-x-auto mb-4 md:mb-0 pb-2 md:pb-0 -mx-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-4 py-2 mx-2 rounded-full text-sm font-medium whitespace-nowrap ${
                category === cat.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 w-full md:w-64"
          />
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Link 
              key={product.id} 
              to={`/product/${product.id}`}
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.is_authentic && (
                  <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center">
                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                    Verified
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold line-clamp-1">{product.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{product.brand} {product.model}</p>
                <div className="flex justify-between items-center">
                  <div className="font-bold text-lg">{product.currency} {product.price.toFixed(2)}</div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
                    {product.seller.reputation || 0}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-1">No products found</h3>
          <p className="text-gray-500">
            {searchQuery 
              ? `No products matching "${searchQuery}" in the ${category === 'all' ? 'marketplace' : category} category`
              : `No products available in the ${category === 'all' ? 'marketplace' : category} category`}
          </p>
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;