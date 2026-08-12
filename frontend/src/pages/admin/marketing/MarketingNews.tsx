import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Newspaper, Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import type { AppDispatch, RootState } from '../../../store/store';
import { fetchAllNews, createNews, updateNews, deleteNews } from '../../../features/marketing/marketingSlice';

const MarketingNews = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { news, loading } = useSelector((state: RootState) => state.marketing);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '', published: false });

  useEffect(() => {
    dispatch(fetchAllNews());
  }, [dispatch]);

  const handleOpenModal = (newsItem?: any) => {
    if (newsItem) {
      setEditingId(newsItem.id);
      setFormData({ title: newsItem.title, content: newsItem.content, published: newsItem.published });
    } else {
      setEditingId(null);
      setFormData({ title: '', content: '', published: false });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) return;
    if (editingId) {
      await dispatch(updateNews({ id: editingId, data: formData }));
    } else {
      await dispatch(createNews(formData));
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this news item?")) {
      await dispatch(deleteNews(id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Newspaper className="w-6 h-6 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">News & Announcements</h1>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          <Plus className="w-5 h-5" />
          <span>Post News</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Published</th>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {news.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{item.title}</div>
                  <div className="text-sm text-gray-500 truncate max-w-md">{item.content}</div>
                </td>
                <td className="px-6 py-4">
                  {item.published ? (
                    <span className="inline-flex items-center space-x-1 text-green-600 bg-green-50 px-2 py-1 rounded-md text-xs font-medium">
                      <CheckCircle className="w-3 h-3" />
                      <span>Yes</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 text-gray-500 bg-gray-100 px-2 py-1 rounded-md text-xs font-medium">
                      <XCircle className="w-3 h-3" />
                      <span>Draft</span>
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(item.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button onClick={() => handleOpenModal(item)} className="text-blue-600 hover:text-blue-800">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
            {news.length === 0 && !loading && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No news items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{editingId ? 'Edit News' : 'Post News'}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content (HTML Supported)</label>
                <textarea 
                  value={formData.content} 
                  onChange={e => setFormData({...formData, content: e.target.value})} 
                  className="w-full h-48 bg-gray-50 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  id="published" 
                  checked={formData.published} 
                  onChange={e => setFormData({...formData, published: e.target.checked})} 
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="published" className="font-medium text-gray-700 cursor-pointer">
                  Publish immediately
                </label>
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
                disabled={!formData.title || !formData.content}
                className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingNews;
