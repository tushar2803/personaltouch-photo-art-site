import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Shield, Truck, Zap, Camera, Palette } from 'lucide-react';
import { motion } from 'motion/react';

export const Home = () => {
  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center overflow-hidden bg-zinc-900">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://picsum.photos/seed/hero/1920/1080?blur=2" 
            className="w-full h-full object-cover opacity-40"
            alt="Hero Background"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold tracking-widest uppercase mb-6">
              Premium Photography & Art
            </span>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] mb-8">
              Capture Moments. <br />
              <span className="text-zinc-400">Create Legacy.</span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-300 mb-10 leading-relaxed max-w-xl">
              Discover a curated collection of world-class photography or transform your personal memories into timeless custom artwork.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/shop" className="px-8 py-4 bg-white text-zinc-900 rounded-full font-bold hover:bg-zinc-100 transition-all flex items-center justify-center group">
                Browse Gallery
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/artwork" className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full font-bold hover:bg-white/20 transition-all flex items-center justify-center">
                Custom Artwork
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { icon: Shield, title: "Secure Payments", desc: "Fully encrypted transactions with Stripe & PayPal support." },
            { icon: Truck, title: "Global Shipping", desc: "Fast and reliable delivery for physical prints and canvases." },
            { icon: Zap, title: "Instant Access", desc: "Download high-resolution digital versions immediately after purchase." }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 bg-white rounded-3xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center mb-6">
                <feature.icon className="text-white w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-zinc-500 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-bold tracking-tight mb-4">Explore Categories</h2>
            <p className="text-zinc-500">Find the perfect piece for your space.</p>
          </div>
          <Link to="/shop" className="text-zinc-900 font-bold flex items-center group">
            View All <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {['Nature', 'Travel', 'Portrait', 'Abstract'].map((cat, i) => (
            <Link 
              key={cat} 
              to={`/shop?category=${cat}`}
              className="group relative aspect-[4/5] overflow-hidden rounded-3xl bg-zinc-100"
            >
              <img 
                src={`https://picsum.photos/seed/${cat}/800/1000`} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                alt={cat}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-2xl font-bold">{cat}</h3>
                <p className="text-sm text-white/80">Explore Collection</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-zinc-900 rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32 blur-3xl" />
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <Palette className="w-16 h-16 text-white/20 mx-auto mb-8" />
            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-8">
              Turn Your Photo Into <br />
              <span className="text-zinc-500">A Masterpiece.</span>
            </h2>
            <p className="text-zinc-400 text-lg mb-12">
              Upload your favorite memories and let our professional artists transform them into stunning oil paintings, sketches, or digital art.
            </p>
            <Link to="/artwork" className="inline-flex items-center px-10 py-5 bg-white text-zinc-900 rounded-full font-bold hover:bg-zinc-100 transition-all group">
              Start Custom Order
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
