import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Image as ImageIcon, Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import type { AppDispatch, RootState } from '../../../store/store';
import { fetchAllBanners, createBanner, updateBanner, deleteBanner } from '../../../features/marketing/marketingSlice';

const MarketingBanners = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { banners, loading } = useSelector((state: RootState) => state.marketing);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [title, setTitle] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [placement, setPlacement] = useState<'HOME' | 'DASHBOARD'>('HOME');
  const [active, setActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dispatch(fetchAllBanners());
  }, [dispatch]);

  const handleOpenModal = (banner?: any) => {
    if (banner) {
      setEditingId(banner.id);
      setTitle(banner.title);
      setTargetUrl(banner.targetUrl || '');
      setPlacement(banner.placement);
      setActive(banner.active);
      setPreviewUrl(banner.imageUrl || '');
      setImageFile(null);
    } else {
      setEditingId(null);
      setTitle('');
      setTargetUrl('');
      setPlacement('HOME');
      setActive(true);
      setPreviewUrl('');
      setImageFile(null);
    }
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!title || (!imageFile && !previewUrl)) return;
    
    const formData = new FormData();
    formData.append('title', title);
    if (targetUrl) formData.append('targetUrl', targetUrl);
    formData.append('active', active.toString());
    formData.append('placement', placement);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    if (editingId) {
      if (!imageFile && previewUrl) formData.append('imageUrl', previewUrl);
      await dispatch(updateBanner({ id: editingId, data: formData }));
    } else {
      await dispatch(createBanner(formData));
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this banner?")) {
      await dispatch(deleteBanner(id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-pink-100 rounded-lg">
            <ImageIcon className="w-6 h-6 text-pink-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Banner Management</h1>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700"
        >
          <Plus className="w-5 h-5" />
          <span>Upload Banner</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <div key={banner.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="h-48 w-full bg-gray-100 relative">
              {banner.imageUrl ? (
                <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-400">No Image</div>
              )}
              <div className="absolute top-2 right-2 flex space-x-2">
                <button onClick={() => handleOpenModal(banner)} className="p-1.5 bg-white rounded shadow text-gray-600 hover:text-blue-600">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(banner.id)} className="p-1.5 bg-white rounded shadow text-gray-600 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4 flex flex-col flex-grow">
              <h3 className="font-semibold text-gray-900 truncate">{banner.title}</h3>
              <div className="text-xs text-gray-500 mt-1 mb-3">Placement: {banner.placement}</div>
              <div className="mt-auto flex items-center justify-between">
                {banner.active ? (
                  <span className="inline-flex items-center space-x-1 text-green-600 bg-green-50 px-2 py-1 rounded-md text-xs font-medium">
                    <CheckCircle className="w-3 h-3" /><span>Active</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 text-gray-500 bg-gray-100 px-2 py-1 rounded-md text-xs font-medium">
                    <XCircle className="w-3 h-3" /><span>Inactive</span>
                  </span>
                )}
                <span className="text-xs text-gray-400">{new Date(banner.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {banners.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          No banners uploaded yet.
        </div>
      )}

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{editingId ? 'Edit Banner' : 'Upload Banner'}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image</label>
                <div 
                  className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 relative overflow-hidden"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <span className="text-sm text-gray-500">Click to upload image</span>
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target URL (Optional)</label>
                <input 
                  type="text" 
                  value={targetUrl} 
                  onChange={e => setTargetUrl(e.target.value)} 
                  placeholder="https://example.com/promo"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Placement</label>
                  <select 
                    value={placement} 
                    onChange={e => setPlacement(e.target.value as any)} 
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="HOME">Home Page</option>
                    <option value="DASHBOARD">Dashboard App</option>
                  </select>
                </div>
                
                <div className="flex items-center pt-8">
                  <input 
                    type="checkbox" 
                    id="bannerActive" 
                    checked={active} 
                    onChange={e => setActive(e.target.checked)} 
                    className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                  />
                  <label htmlFor="bannerActive" className="ml-2 font-medium text-gray-700 cursor-pointer">
                    Is Active?
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-8">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={!title || (!imageFile && !previewUrl)}
                className="px-5 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
              >
                Save Banner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingBanners;
