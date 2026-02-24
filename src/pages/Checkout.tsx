import React, { useState } from 'react';
import { useAuthStore, useCartStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CreditCard, Truck, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

export const Checkout = () => {
  const { items, total, clearCart } = useCartStore();
  const { user, token } = useAuthStore();
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items,
          total_amount: total(),
          shipping_address: address
        }),
      });
      if (res.ok) {
        setSuccess(true);
        clearCart();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-12 rounded-[3rem] border border-zinc-100 shadow-xl"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="text-green-600 w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Order Confirmed!</h2>
          <p className="text-zinc-500 mb-8 leading-relaxed">
            Thank you for your purchase. We've sent a confirmation email to your inbox. You can track your order status in your dashboard.
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-8 py-4 bg-zinc-900 text-white rounded-full font-bold hover:bg-zinc-800 transition-all"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight mb-12">Checkout</h1>

      <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <Truck className="w-5 h-5 mr-3" /> Shipping Information
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Full Name</label>
                <input type="text" defaultValue={user?.name} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Shipping Address</label>
                <textarea 
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={4} 
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900" 
                  placeholder="Street address, City, State, ZIP"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <CreditCard className="w-5 h-5 mr-3" /> Payment Method
            </h2>
            <div className="p-6 border-2 border-zinc-900 bg-zinc-50 rounded-2xl flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-8 bg-zinc-900 rounded flex items-center justify-center text-white font-bold text-[10px]">VISA</div>
                <div>
                  <p className="font-bold text-sm">Pay with Card</p>
                  <p className="text-xs text-zinc-500">Secure transaction via Stripe</p>
                </div>
              </div>
              <div className="w-5 h-5 rounded-full border-4 border-zinc-900" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Card Number</label>
                <input type="text" placeholder="**** **** **** ****" className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700">Expiry</label>
                  <input type="text" placeholder="MM/YY" className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700">CVC</label>
                  <input type="text" placeholder="***" className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm sticky top-28">
            <h2 className="text-2xl font-bold mb-6">Summary</h2>
            <div className="space-y-4 mb-8">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-zinc-500">{item.title} x {item.quantity}</span>
                  <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="h-px bg-zinc-100" />
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>${total().toFixed(2)}</span>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-zinc-900 text-white rounded-full font-bold hover:bg-zinc-800 transition-all flex items-center justify-center"
            >
              {loading ? 'Processing...' : `Pay $${total().toFixed(2)}`}
            </button>

            <div className="mt-6 flex items-center justify-center space-x-2 text-zinc-400">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Secure Checkout</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
