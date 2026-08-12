import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Megaphone, Plus, Image, Globe, Edit2, Trash2, X } from 'lucide-react';
import type { RootState, AppDispatch } from '../../store/store';
import { fetchAllBanners, fetchAllNews, createBanner, updateBanner, deleteBanner } from '../../features/marketing/marketingSlice';
import type { Banner } from '../../features/marketing/marketingSlice';

const AdminMarketing = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { banners, news, loading } = useSelector((state: RootState) => state.marketing);
  
  const [activeTab, setActiveTab] = useState<'BANNERS' | 'NEWS'>('BANNERS');
  
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  
  const [bannerForm, setBannerForm] = useState({
    title: '',
    imageUrl: '',
    targetUrl: '',
    active: true,
    placement: 'HOME' as 'HOME' | 'DASHBOARD'
  });

  const openBannerModal = (banner?: Banner) => {
    if (banner) {
      setEditingBanner(banner);
      setBannerForm({
        title: banner.title,
        imageUrl: banner.imageUrl,
        targetUrl: banner.targetUrl,
        active: banner.active,
        placement: banner.placement
      });
      setBannerFile(null);
    } else {
      setEditingBanner(null);
      setBannerForm({
        title: '',
        imageUrl: '',
        targetUrl: '',
        active: true,
        placement: 'HOME'
      });
      setBannerFile(null);
    }
    setIsBannerModalOpen(true);
  };

  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', bannerForm.title);
    if (bannerForm.targetUrl) formData.append('targetUrl', bannerForm.targetUrl);
    formData.append('active', bannerForm.active.toString());
    formData.append('placement', bannerForm.placement);
    
    if (bannerFile) {
      formData.append('image', bannerFile);
    }
    
    if (editingBanner) {
      if (bannerForm.imageUrl) formData.append('imageUrl', bannerForm.imageUrl);
      await dispatch(updateBanner({ id: editingBanner.id, data: formData as any }));
    } else {
      await dispatch(createBanner(formData as any));
    }
    setIsBannerModalOpen(false);
  };

  useEffect(() => {
    dispatch(fetchAllBanners());
    dispatch(fetchAllNews());
  }, [dispatch]);

  const renderBanners = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Manage Banners</h3>
        <button 
          onClick={() => openBannerModal()}
          className="flex items-center text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Banner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map(banner => (
          <div key={banner.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group">
            <div className="h-40 bg-gray-100 relative">
              {banner.imageUrl ? (
                <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Image className="h-10 w-10" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => openBannerModal(banner)}
                  className="p-1.5 bg-white rounded shadow text-gray-600 hover:text-blue-600"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => dispatch(deleteBanner(banner.id))} 
                  className="p-1.5 bg-white rounded shadow text-gray-600 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-900 line-clamp-1">{banner.title}</h4>
                <span className={`text-xs px-2 py-0.5 rounded-full ${banner.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {banner.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-xs text-gray-500 flex items-center mb-1">
                <Globe className="h-3 w-3 mr-1" />
                Placement: {banner.placement}
              </p>
              {banner.targetUrl && (
                <a href={banner.targetUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline line-clamp-1">
                  {banner.targetUrl}
                </a>
              )}
            </div>
          </div>
        ))}
        {banners.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            No banners found. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );

  const renderNews = () => (
    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
      News Management Interface Coming Soon
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Megaphone className="mr-3 h-6 w-6 text-orange-500" />
          Marketing & Announcements
        </h1>
        <p className="text-sm text-gray-500 mt-1">Manage promotional banners and broadcast news to users</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('BANNERS')}
            className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${
              activeTab === 'BANNERS' 
                ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/50' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            Promotional Banners
          </button>
          <button
            onClick={() => setActiveTab('NEWS')}
            className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${
              activeTab === 'NEWS' 
                ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/50' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            News & Announcements
          </button>
        </div>
      </div>

      {activeTab === 'BANNERS' ? renderBanners() : renderNews()}

      {isBannerModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">
                {editingBanner ? 'Edit Banner' : 'Create Banner'}
              </h3>
              <button 
                onClick={() => setIsBannerModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleBannerSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm({...bannerForm, title: e.target.value})}
                  placeholder="E.g., Summer Promotion"
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image {editingBanner ? '(Leave empty to keep current)' : <span className="text-red-500">*</span>}</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                  required={!editingBanner}
                />
                {editingBanner && bannerForm.imageUrl && !bannerFile && (
                  <div className="mt-2 text-xs text-gray-500">
                    Current image: <a href={bannerForm.imageUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">View</a>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target URL (Optional)</label>
                <input 
                  type="url" 
                  value={bannerForm.targetUrl}
                  onChange={(e) => setBannerForm({...bannerForm, targetUrl: e.target.value})}
                  placeholder="https://example.com/promo"
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Placement</label>
                  <select 
                    value={bannerForm.placement}
                    onChange={(e) => setBannerForm({...bannerForm, placement: e.target.value as any})}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="HOME">Home</option>
                    <option value="DASHBOARD">Dashboard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="flex items-center h-[42px]">
                    <label className="flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={bannerForm.active}
                        onChange={(e) => setBannerForm({...bannerForm, active: e.target.checked})}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Active</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsBannerModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={!bannerForm.title || (!editingBanner && !bannerFile)}
                >
                  {editingBanner ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMarketing;
