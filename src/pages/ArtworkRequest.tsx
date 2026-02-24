import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload, CheckCircle, Info, Palette, Ruler, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '../store';

const schema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid phone number required'),
  address: z.string().min(5, 'Address is required'),
  postal_code: z.string().min(5, 'Postal code is required'),
  style: z.string().min(1, 'Please select a style'),
  size: z.string().min(1, 'Please select a size'),
  notes: z.string().optional(),
  quantity: z.number().min(1),
});

export const ArtworkRequest = () => {
  const [photo, setPhoto] = useState<File | null>(null);
  const [reference, setReference] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: user?.name || '',
      email: user?.email || '',
      quantity: 1,
      style: '',
      size: '',
      address: '',
      phone: '',
      postal_code: '',
      notes: ''
    }
  });

  const onSubmit = async (data: any) => {
    if (!photo) {
      alert('Please upload a photo to transform.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    Object.keys(data).forEach(key => formData.append(key, data[key]));
    formData.append('photo', photo);
    if (reference) formData.append('reference', reference);
    if (user) formData.append('user_id', user.id.toString());

    try {
      const res = await fetch('/api/artwork/request', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
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
          <h2 className="text-3xl font-bold mb-4">Request Received!</h2>
          <p className="text-zinc-500 mb-8 leading-relaxed">
            Our team of artists will review your photo and get back to you within 24-48 hours with a quote and timeline.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-8 py-4 bg-zinc-900 text-white rounded-full font-bold hover:bg-zinc-800 transition-all"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold tracking-tight mb-4">Turn Your Photo Into Artwork</h1>
        <p className="text-zinc-500 max-w-2xl mx-auto">
          Upload your favorite photo and select a style. Our professional artists will hand-craft a unique masterpiece just for you.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* Section 1: Contact Info */}
          <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white text-sm font-bold">1</div>
              <h2 className="text-xl font-bold">Contact Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Full Name</label>
                <input {...register('full_name')} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900" />
                {errors.full_name && <p className="text-red-500 text-xs">{errors.full_name.message as string}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Email Address</label>
                <input {...register('email')} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900" />
                {errors.email && <p className="text-red-500 text-xs">{errors.email.message as string}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Phone Number</label>
                <input {...register('phone')} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900" />
                {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message as string}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Postal Code</label>
                <input {...register('postal_code')} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900" />
                {errors.postal_code && <p className="text-red-500 text-xs">{errors.postal_code.message as string}</p>}
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-zinc-700">Shipping Address</label>
                <textarea {...register('address')} rows={3} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900" />
                {errors.address && <p className="text-red-500 text-xs">{errors.address.message as string}</p>}
              </div>
            </div>
          </div>

          {/* Section 2: Upload */}
          <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white text-sm font-bold">2</div>
              <h2 className="text-xl font-bold">Upload Your Photo</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-sm font-medium text-zinc-700">Main Photo (Required)</label>
                <div 
                  className={`relative border-2 border-dashed rounded-3xl p-8 text-center transition-colors ${photo ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 hover:border-zinc-400'}`}
                >
                  <input 
                    type="file" 
                    onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept="image/*"
                  />
                  {photo ? (
                    <div className="space-y-2">
                      <CheckCircle className="w-8 h-8 text-zinc-900 mx-auto" />
                      <p className="text-sm font-bold truncate">{photo.name}</p>
                      <button type="button" onClick={() => setPhoto(null)} className="text-xs text-red-500 underline">Remove</button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-zinc-400 mx-auto" />
                      <p className="text-sm text-zinc-500">Click or drag to upload</p>
                      <p className="text-[10px] text-zinc-400 uppercase tracking-widest">JPG, PNG up to 10MB</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-sm font-medium text-zinc-700">Reference Image (Optional)</label>
                <div 
                  className={`relative border-2 border-dashed rounded-3xl p-8 text-center transition-colors ${reference ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 hover:border-zinc-400'}`}
                >
                  <input 
                    type="file" 
                    onChange={(e) => setReference(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept="image/*"
                  />
                  {reference ? (
                    <div className="space-y-2">
                      <CheckCircle className="w-8 h-8 text-zinc-900 mx-auto" />
                      <p className="text-sm font-bold truncate">{reference.name}</p>
                      <button type="button" onClick={() => setReference(null)} className="text-xs text-red-500 underline">Remove</button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-zinc-400 mx-auto" />
                      <p className="text-sm text-zinc-500">Click or drag to upload</p>
                      <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Style reference</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Section 3: Style & Size */}
          <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm sticky top-28">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white text-sm font-bold">3</div>
              <h2 className="text-xl font-bold">Customization</h2>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 flex items-center">
                  <Palette className="w-4 h-4 mr-2" /> Artwork Style
                </label>
                <select {...register('style')} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900">
                  <option value="">Select a style</option>
                  <option value="Oil Painting">Oil Painting</option>
                  <option value="Pencil Sketch">Pencil Sketch</option>
                  <option value="Watercolor">Watercolor</option>
                  <option value="Digital Art">Digital Art</option>
                  <option value="Cartoon Style">Cartoon Style</option>
                </select>
                {errors.style && <p className="text-red-500 text-xs">{errors.style.message as string}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 flex items-center">
                  <Ruler className="w-4 h-4 mr-2" /> Size Selection
                </label>
                <select {...register('size')} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900">
                  <option value="">Select a size</option>
                  <option value="A4 (8.3 x 11.7 in)">A4 (8.3 x 11.7 in)</option>
                  <option value="A3 (11.7 x 16.5 in)">A3 (11.7 x 16.5 in)</option>
                  <option value="A2 (16.5 x 23.4 in)">A2 (16.5 x 23.4 in)</option>
                  <option value="Canvas (Custom)">Canvas (Custom)</option>
                  <option value="Digital Only">Digital Only</option>
                </select>
                {errors.size && <p className="text-red-500 text-xs">{errors.size.message as string}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 flex items-center">
                  <FileText className="w-4 h-4 mr-2" /> Additional Notes
                </label>
                <textarea {...register('notes')} placeholder="Any specific details?" rows={4} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900" />
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-4 bg-zinc-900 text-white rounded-full font-bold hover:bg-zinc-800 transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? 'Processing...' : 'Submit Request'}
                </button>
                <p className="text-[10px] text-zinc-400 text-center mt-4 uppercase tracking-widest">
                  No payment required now. We'll send a quote.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
