import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Palette, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  XCircle,
  Download,
  Upload
} from 'lucide-react';
import { motion } from 'motion/react';

export const AdminDashboard = () => {
  const { token } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [artworkRequests, setArtworkRequests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'stats' | 'orders' | 'artwork'>('stats');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ordersRes, artworkRes] = await Promise.all([
          fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admin/orders', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admin/artwork-requests', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setStats(await statsRes.json());
        setOrders(await ordersRes.json());
        setArtworkRequests(await artworkRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const updateArtworkStatus = async (id: number, status: string, file?: File) => {
    const formData = new FormData();
    formData.append('status', status);
    if (file) formData.append('final_artwork', file);

    try {
      const res = await fetch(`/api/admin/artwork-requests/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        // Refresh data
        const artworkRes = await fetch('/api/admin/artwork-requests', { headers: { Authorization: `Bearer ${token}` } });
        setArtworkRequests(await artworkRes.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Admin Panel</h1>
          <p className="text-zinc-500">Manage your business operations.</p>
        </div>

        <div className="flex bg-white p-1.5 rounded-2xl border border-zinc-100 shadow-sm">
          {[
            { id: 'stats', label: 'Overview', icon: LayoutDashboard },
            { id: 'orders', label: 'Orders', icon: ShoppingBag },
            { id: 'artwork', label: 'Artwork', icon: Palette }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-zinc-100 rounded-3xl" />)}
          </div>
          <div className="h-96 bg-zinc-100 rounded-3xl" />
        </div>
      ) : (
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {activeTab === 'stats' && stats && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Revenue', value: `$${stats.totalSales.toFixed(2)}`, icon: TrendingUp, color: 'text-emerald-600' },
                  { label: 'Photo Orders', value: stats.orderCount, icon: ShoppingBag, color: 'text-blue-600' },
                  { label: 'Artwork Requests', value: stats.artworkCount, icon: Palette, color: 'text-purple-600' },
                  { label: 'Total Customers', value: stats.userCount, icon: Users, color: 'text-zinc-600' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-zinc-50 rounded-2xl">
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                    <h3 className="text-3xl font-bold">{stat.value}</h3>
                  </div>
                ))}
              </div>
              
              <div className="bg-white p-8 rounded-[3rem] border border-zinc-100 shadow-sm">
                <h2 className="text-2xl font-bold mb-8">Recent Activity</h2>
                <div className="space-y-6">
                  {orders.slice(0, 5).map(order => (
                    <div key={order.id} className="flex items-center justify-between py-4 border-b border-zinc-50 last:border-0">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-zinc-400" />
                        </div>
                        <div>
                          <p className="font-bold">Order #{order.id} - {order.customer_name}</p>
                          <p className="text-xs text-zinc-500">{new Date(order.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <p className="font-bold text-lg">${order.total_amount.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white rounded-[3rem] border border-zinc-100 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-100">
                    <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-zinc-400">Order ID</th>
                    <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-zinc-400">Customer</th>
                    <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-zinc-400">Total</th>
                    <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-zinc-400">Status</th>
                    <th className="px-8 py-6 text-xs font-bold uppercase tracking-widest text-zinc-400">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                      <td className="px-8 py-6 font-bold">#{order.id}</td>
                      <td className="px-8 py-6">
                        <p className="font-medium">{order.customer_name}</p>
                        <p className="text-xs text-zinc-500">{order.customer_email}</p>
                      </td>
                      <td className="px-8 py-6 font-bold">${order.total_amount.toFixed(2)}</td>
                      <td className="px-8 py-6">
                        <span className="px-4 py-1.5 rounded-full bg-zinc-100 text-zinc-700 text-[10px] font-bold uppercase tracking-wider">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-sm text-zinc-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'artwork' && (
            <div className="grid grid-cols-1 gap-8">
              {artworkRequests.map(request => (
                <div key={request.id} className="bg-white p-8 rounded-[3rem] border border-zinc-100 shadow-sm grid grid-cols-1 lg:grid-cols-4 gap-12">
                  <div className="lg:col-span-1 space-y-6">
                    <div className="aspect-square rounded-3xl overflow-hidden bg-zinc-100">
                      <img src={request.original_image_url} className="w-full h-full object-cover" alt="Customer Upload" />
                    </div>
                    <div className="flex gap-2">
                      <a 
                        href={request.original_image_url} 
                        download 
                        className="flex-1 py-3 bg-zinc-100 text-zinc-900 rounded-xl font-bold text-xs flex items-center justify-center hover:bg-zinc-200 transition-all"
                      >
                        <Download className="w-4 h-4 mr-2" /> Download
                      </a>
                    </div>
                  </div>

                  <div className="lg:col-span-2 space-y-6">
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Request #{request.id}</p>
                      <h3 className="text-2xl font-bold">{request.style}</h3>
                      <p className="text-zinc-500">{request.size} • Qty: {request.quantity}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Customer</p>
                        <p className="font-medium">{request.full_name}</p>
                        <p className="text-sm text-zinc-500">{request.email}</p>
                        <p className="text-sm text-zinc-500">{request.phone}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Shipping</p>
                        <p className="text-sm text-zinc-500 leading-relaxed">{request.address}, {request.postal_code}</p>
                      </div>
                    </div>

                    {request.notes && (
                      <div>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Notes</p>
                        <p className="text-sm text-zinc-500 bg-zinc-50 p-4 rounded-2xl italic">"{request.notes}"</p>
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-1 space-y-6 flex flex-col justify-center">
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Update Status</p>
                      <button 
                        onClick={() => updateArtworkStatus(request.id, 'in_progress')}
                        className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center transition-all ${
                          request.status === 'in_progress' ? 'bg-blue-600 text-white shadow-lg' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                        }`}
                      >
                        <Clock className="w-4 h-4 mr-2" /> In Progress
                      </button>
                      
                      <div className="relative">
                        <input 
                          type="file" 
                          id={`upload-${request.id}`}
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) updateArtworkStatus(request.id, 'awaiting_approval', file);
                          }}
                        />
                        <label 
                          htmlFor={`upload-${request.id}`}
                          className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center cursor-pointer transition-all ${
                            request.status === 'awaiting_approval' ? 'bg-amber-600 text-white shadow-lg' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                          }`}
                        >
                          <Upload className="w-4 h-4 mr-2" /> {request.final_artwork_url ? 'Update Artwork' : 'Upload Artwork'}
                        </label>
                      </div>

                      <button 
                        onClick={() => updateArtworkStatus(request.id, 'completed')}
                        className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center transition-all ${
                          request.status === 'completed' ? 'bg-green-600 text-white shadow-lg' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" /> Mark Completed
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};
