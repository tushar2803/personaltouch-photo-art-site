import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store';
import { ShoppingCart, ArrowLeft, ShieldCheck, Truck, Download } from 'lucide-react';
import { motion } from 'motion/react';

export const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-24 animate-pulse">Loading...</div>;
  if (!product) return <div className="max-w-7xl mx-auto px-4 py-24">Product not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-zinc-500 hover:text-zinc-900 mb-12 group"
      >
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Gallery
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative aspect-[4/5] rounded-[3rem] overflow-hidden bg-zinc-100 shadow-2xl"
        >
          <img 
            src={product.image_url} 
            className="w-full h-full object-cover" 
            alt={product.title}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10 select-none">
            <span className="text-6xl font-black rotate-45 tracking-[2em] text-zinc-900">PERSONALTOUCH</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col justify-center"
        >
          <span className="text-zinc-400 text-sm font-bold uppercase tracking-widest mb-4">{product.category}</span>
          <h1 className="text-5xl font-bold tracking-tight text-zinc-900 mb-6">{product.title}</h1>
          <p className="text-3xl font-bold text-zinc-900 mb-8">${product.price.toFixed(2)}</p>
          
          <div className="prose prose-zinc mb-12">
            <p className="text-zinc-500 leading-relaxed text-lg">
              {product.description} This premium high-resolution photograph is captured with professional-grade equipment, ensuring every detail is preserved. Perfect for home decor, office spaces, or digital collections.
            </p>
          </div>

          <div className="space-y-6 mb-12">
            <div className="flex items-center space-x-4 text-sm text-zinc-600">
              <ShieldCheck className="w-5 h-5 text-zinc-900" />
              <span>Commercial license included</span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-zinc-600">
              <Truck className="w-5 h-5 text-zinc-900" />
              <span>Free global shipping on physical prints</span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-zinc-600">
              <Download className="w-5 h-5 text-zinc-900" />
              <span>Instant high-res digital download</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => addItem(product)}
              className="flex-1 px-10 py-5 bg-zinc-900 text-white rounded-full font-bold hover:bg-zinc-800 transition-all flex items-center justify-center group"
            >
              <ShoppingCart className="w-5 h-5 mr-3" />
              Add to Cart
            </button>
            <button className="flex-1 px-10 py-5 bg-zinc-100 text-zinc-900 rounded-full font-bold hover:bg-zinc-200 transition-all">
              Buy Now
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
