import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store';
import { Package, Palette, Clock, CheckCircle, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

export const Dashboard = () => {
  const { user, token } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [artworkRequests, setArtworkRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, artworkRes] = await Promise.all([
          fetch('/api/orders/my', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/artwork/my', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const ordersData = await ordersRes.json();
        const artworkData = await artworkRes.json();
        setOrders(ordersData);
        setArtworkRequests(artworkData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Hello, {user?.name}</h1>
        <p className="text-zinc-500">Manage your orders and custom artwork requests.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Photo Orders */}
        <div className="space-y-8">
          <div className="flex items-center space-x-3">
            <Package className="w-6 h-6 text-zinc-900" />
            <h2 className="text-2xl font-bold">Photo Orders</h2>
          </div>
          
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(i => <div key={i} className="h-32 bg-zinc-100 rounded-3xl animate-pulse" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 bg-white rounded-3xl border border-zinc-100 text-center">
              <p className="text-zinc-500">No photo orders yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Order #{order.id}</p>
                    <p className="font-bold text-lg">${order.total_amount.toFixed(2)}</p>
                    <p className="text-sm text-zinc-500">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Artwork Requests */}
        <div className="space-y-8">
          <div className="flex items-center space-x-3">
            <Palette className="w-6 h-6 text-zinc-900" />
            <h2 className="text-2xl font-bold">Custom Artwork</h2>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(i => <div key={i} className="h-48 bg-zinc-100 rounded-3xl animate-pulse" />)}
            </div>
          ) : artworkRequests.length === 0 ? (
            <div className="p-12 bg-white rounded-3xl border border-zinc-100 text-center">
              <p className="text-zinc-500">No artwork requests yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {artworkRequests.map((request) => (
                <div key={request.id} className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Request #{request.id}</p>
                      <h3 className="font-bold text-xl">{request.style}</h3>
                      <p className="text-sm text-zinc-500">{request.size}</p>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      request.status === 'completed' ? 'bg-green-100 text-green-700' : 
                      request.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-zinc-100 text-zinc-700'
                    }`}>
                      {request.status}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-100">
                      <img src={request.original_image_url} className="w-full h-full object-cover" alt="Original" />
                    </div>
                    {request.final_artwork_url && (
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-100 relative group">
                        <img src={request.final_artwork_url} className="w-full h-full object-cover" alt="Final" />
                        <a 
                          href={request.final_artwork_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                  </div>

                  {request.status === 'awaiting_approval' && (
                    <div className="pt-4 border-t border-zinc-100 flex gap-4">
                      <button className="flex-1 py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-zinc-800 transition-all">
                        Approve Final Art
                      </button>
                      <button className="flex-1 py-3 bg-zinc-100 text-zinc-900 rounded-xl font-bold text-sm hover:bg-zinc-200 transition-all">
                        Request Revision
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
