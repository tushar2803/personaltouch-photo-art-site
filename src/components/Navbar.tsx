import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, X, Camera } from 'lucide-react';
import { useAuthStore, useCartStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';

export const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { items } = useCartStore();
  const [isOpen, setIsOpen] = React.useState(false);
  const navigate = useNavigate();

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-zinc-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform">
              <Camera className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900">PersonalTouch</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/shop" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">Shop Photos</Link>
            <Link to="/artwork" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">Custom Artwork</Link>
            
            <div className="h-6 w-px bg-zinc-200" />

            <Link to="/cart" className="relative p-2 text-zinc-600 hover:text-zinc-900 transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-zinc-900 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center space-x-2 text-sm font-medium text-zinc-600 hover:text-zinc-900">
                  <User className="w-4 h-4" />
                  <span>{user.name}</span>
                </Link>
                <button onClick={() => { logout(); navigate('/'); }} className="p-2 text-zinc-600 hover:text-red-600 transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="px-5 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-full hover:bg-zinc-800 transition-all shadow-sm">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center space-x-4">
            <Link to="/cart" className="relative p-2 text-zinc-600">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-zinc-900 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-zinc-600">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-zinc-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              <Link to="/shop" onClick={() => setIsOpen(false)} className="block px-3 py-4 text-base font-medium text-zinc-600 hover:bg-zinc-50 rounded-xl">Shop Photos</Link>
              <Link to="/artwork" onClick={() => setIsOpen(false)} className="block px-3 py-4 text-base font-medium text-zinc-600 hover:bg-zinc-50 rounded-xl">Custom Artwork</Link>
              {user ? (
                <>
                  <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} onClick={() => setIsOpen(false)} className="block px-3 py-4 text-base font-medium text-zinc-600 hover:bg-zinc-50 rounded-xl">Dashboard</Link>
                  <button onClick={() => { logout(); setIsOpen(false); navigate('/'); }} className="w-full text-left px-3 py-4 text-base font-medium text-red-600 hover:bg-red-50 rounded-xl">Sign Out</button>
                </>
              ) : (
                <Link to="/login" onClick={() => setIsOpen(false)} className="block px-3 py-4 text-base font-medium text-zinc-900 bg-zinc-100 rounded-xl">Sign In</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
