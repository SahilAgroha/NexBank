import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Save } from 'lucide-react';

const MarketingLogo = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    if (!imageFile) return;
    setLoading(true);
    // Mock save delay
    setTimeout(() => {
      setLoading(false);
      alert("Platform logo successfully updated!");
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-orange-100 rounded-lg">
          <ImageIcon className="w-6 h-6 text-orange-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Logo</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-2xl">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Branding</h2>
        <p className="text-sm text-gray-500 mb-6">
          Upload a new logo to be displayed on the platform's authentication pages and the top left of the dashboard.
          Recommended format: PNG with transparent background.
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Primary Logo</label>
            <div 
              className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 relative overflow-hidden bg-gray-50"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Logo Preview" className="h-32 object-contain p-4" />
              ) : (
                <div className="text-center">
                  <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm text-gray-500">Click to upload logo image</span>
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

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button 
              onClick={handleSave}
              disabled={!imageFile || loading}
              className="flex items-center space-x-2 bg-orange-600 text-white px-6 py-2.5 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{loading ? 'Saving...' : 'Save New Logo'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingLogo;
