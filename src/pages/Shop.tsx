import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, ShoppingCart, Eye } from 'lucide-react';
import { useCartStore } from '../store';
import { motion } from 'motion/react';

export const Shop = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || p.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Photo Gallery</h1>
          <p className="text-zinc-500">Premium photography for your collection.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search photos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 w-full sm:w-64"
            />
          </div>
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2.5 bg-white border border-zinc-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            <option value="All">All Categories</option>
            <option value="Nature">Nature</option>
            <option value="Travel">Travel</option>
            <option value="Portrait">Portrait</option>
            <option value="Abstract">Abstract</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[4/5] bg-zinc-200 rounded-3xl mb-4" />
              <div className="h-4 bg-zinc-200 rounded w-2/3 mb-2" />
              <div className="h-4 bg-zinc-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <motion.div 
              key={product.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="group"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-zinc-100 mb-4">
                <img 
                  src={product.image_url} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  alt={product.title}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <Link 
                    to={`/product/${product.id}`}
                    className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-zinc-900 hover:bg-zinc-100 transition-colors"
                  >
                    <Eye className="w-5 h-5" />
                  </Link>
                  <button 
                    onClick={() => addItem(product)}
                    className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-zinc-900 hover:bg-zinc-100 transition-colors"
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                </div>
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/80 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider text-zinc-900">
                    {product.category}
                  </span>
                </div>
              </div>
              <h3 className="font-bold text-zinc-900 mb-1">{product.title}</h3>
              <p className="text-zinc-500 text-sm">${product.price.toFixed(2)}</p>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filteredProducts.length === 0 && (
        <div className="text-center py-24">
          <p className="text-zinc-500">No products found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};
