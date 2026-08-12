import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { User as UserIcon, Lock, Save, Share2, Copy, Check } from 'lucide-react';
import type { AppDispatch, RootState } from '../../store/store';
import { updateProfile, changePassword } from '../../features/auth/authSlice';
import api from '../../api/api';

const PartnerSettings = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'SECURITY'>('PROFILE');
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    phone: '',
    email: user?.email || '',
    partnerCode: ''
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Fetch full profile to get phone and partnerCode
    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/profile');
        if (response.data?.data) {
          setProfileData({
            fullName: response.data.data.fullName,
            phone: response.data.data.phone,
            email: response.data.data.email,
            partnerCode: response.data.data.partnerCode || 'N/A'
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      await dispatch(updateProfile({ fullName: profileData.fullName, phone: profileData.phone })).unwrap();
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (error: any) {
      setMessage({ text: error || 'Failed to update profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ text: 'New passwords do not match', type: 'error' });
      return;
    }
    
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      await dispatch(changePassword({ 
        oldPassword: passwordData.oldPassword, 
        newPassword: passwordData.newPassword 
      })).unwrap();
      setMessage({ text: 'Password changed successfully!', type: 'success' });
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setMessage({ text: error || 'Failed to change password', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(profileData.partnerCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = `${window.location.origin}/signup?ref=${profileData.partnerCode}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile & Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account information and security.</p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => { setActiveTab('PROFILE'); setMessage({ text: '', type: '' }); }}
            className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors ${
              activeTab === 'PROFILE' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center">
              <UserIcon className="w-4 h-4 mr-2" />
              Profile Information
            </div>
          </button>
          <button
            onClick={() => { setActiveTab('SECURITY'); setMessage({ text: '', type: '' }); }}
            className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors ${
              activeTab === 'SECURITY' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center">
              <Lock className="w-4 h-4 mr-2" />
              Security
            </div>
          </button>
        </div>

        <div className="p-6">
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {message.text}
            </div>
          )}

          {activeTab === 'PROFILE' && (
            <div className="space-y-8">
              {/* Partner Code Share Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 flex items-center">
                      <Share2 className="w-5 h-5 mr-2" />
                      Refer Customers
                    </h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Share your unique Partner ID or direct link with customers to link them to your account.
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-blue-800 uppercase tracking-wider mb-1">Your Partner ID</label>
                    <div className="flex">
                      <input 
                        type="text" 
                        readOnly 
                        value={profileData.partnerCode} 
                        className="bg-white border-y border-l border-blue-200 text-blue-900 text-sm rounded-l-lg w-full p-2.5 font-mono focus:outline-none"
                      />
                      <button 
                        onClick={handleCopyCode}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg px-4 flex items-center transition-colors"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-blue-800 uppercase tracking-wider mb-1">Direct Signup Link</label>
                    <div className="flex">
                      <input 
                        type="text" 
                        readOnly 
                        value={shareUrl} 
                        className="bg-white border-y border-l border-blue-200 text-blue-900 text-sm rounded-l-lg w-full p-2.5 font-mono focus:outline-none text-ellipsis"
                      />
                      <button 
                        onClick={() => { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg px-4 flex items-center transition-colors"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Form */}
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                      className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input 
                      type="text" 
                      required
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      disabled
                      value={profileData.email}
                      className="w-full border-gray-300 rounded-lg shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email address cannot be changed.</p>
                  </div>
                </div>
                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm font-medium"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'SECURITY' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input 
                  type="password" 
                  required
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input 
                  type="password" 
                  required
                  minLength={6}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input 
                  type="password" 
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm font-medium"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnerSettings;
