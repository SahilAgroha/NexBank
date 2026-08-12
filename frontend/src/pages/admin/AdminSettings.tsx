import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Settings, Save, Smartphone, Mail, Building, ShieldCheck, Palette, Bell } from 'lucide-react';
import type { RootState, AppDispatch } from '../../store/store';
import { fetchSettings, updateSettingsBatch } from '../../features/settings/settingsSlice';
import type { SystemSetting } from '../../features/settings/settingsSlice';

const AdminSettings = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { settings, loading } = useSelector((state: RootState) => state.settings);
  
  const [activeTab, setActiveTab] = useState('COMPANY');
  const [localSettings, setLocalSettings] = useState<Record<string, SystemSetting>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    const settingsMap: Record<string, SystemSetting> = {};
    settings.forEach(s => {
      settingsMap[s.settingKey] = s;
    });
    setLocalSettings(settingsMap);
  }, [settings]);

  const handleChange = (key: string, value: string, category: SystemSetting['category']) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        settingKey: key,
        settingValue: value,
        category: category
      }
    }));
  };

  const handleSave = async (category: SystemSetting['category']) => {
    setIsSaving(true);
    setSaveMessage('');
    
    const settingsToSave = Object.values(localSettings).filter(s => s.category === category);
    
    try {
      await dispatch(updateSettingsBatch(settingsToSave)).unwrap();
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      setSaveMessage('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderCompanySettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Company Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
          <input 
            type="text" 
            value={localSettings['COMPANY_NAME']?.settingValue || ''}
            onChange={(e) => handleChange('COMPANY_NAME', e.target.value, 'COMPANY')}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID / Registration Number</label>
          <input 
            type="text" 
            value={localSettings['COMPANY_TAX_ID']?.settingValue || ''}
            onChange={(e) => handleChange('COMPANY_TAX_ID', e.target.value, 'COMPANY')}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Registered Address</label>
          <textarea 
            value={localSettings['COMPANY_ADDRESS']?.settingValue || ''}
            onChange={(e) => handleChange('COMPANY_ADDRESS', e.target.value, 'COMPANY')}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <button 
          onClick={() => handleSave('COMPANY')}
          disabled={isSaving}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">SMTP Email Configuration</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
          <input 
            type="text" 
            value={localSettings['EMAIL_HOST']?.settingValue || ''}
            onChange={(e) => handleChange('EMAIL_HOST', e.target.value, 'EMAIL')}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label>
          <input 
            type="number" 
            value={localSettings['EMAIL_PORT']?.settingValue || ''}
            onChange={(e) => handleChange('EMAIL_PORT', e.target.value, 'EMAIL')}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input 
            type="text" 
            value={localSettings['EMAIL_USER']?.settingValue || ''}
            onChange={(e) => handleChange('EMAIL_USER', e.target.value, 'EMAIL')}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input 
            type="password" 
            value={localSettings['EMAIL_PASS']?.settingValue || ''}
            onChange={(e) => handleChange('EMAIL_PASS', e.target.value, 'EMAIL')}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <button 
          onClick={() => handleSave('EMAIL')}
          disabled={isSaving}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </button>
      </div>
    </div>
  );

  const renderSmsSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">SMS Gateway Configuration</h3>
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
          <input 
            type="text" 
            value={localSettings['SMS_API_KEY']?.settingValue || ''}
            onChange={(e) => handleChange('SMS_API_KEY', e.target.value, 'SMS')}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sender ID</label>
          <input 
            type="text" 
            value={localSettings['SMS_SENDER_ID']?.settingValue || ''}
            onChange={(e) => handleChange('SMS_SENDER_ID', e.target.value, 'SMS')}
            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <button 
          onClick={() => handleSave('SMS')}
          disabled={isSaving}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </button>
      </div>
    </div>
  );

  const tabs = [
    { id: 'COMPANY', label: 'Company Profile', icon: Building },
    { id: 'BRAND', label: 'Brand & Logo', icon: Palette },
    { id: 'EMAIL', label: 'Email Configuration', icon: Mail },
    { id: 'SMS', label: 'SMS Gateway', icon: Smartphone },
    { id: 'WHATSAPP', label: 'WhatsApp', icon: Bell },
    { id: 'COMPLIANCE', label: 'Compliance & Limits', icon: ShieldCheck },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Settings className="mr-3 h-6 w-6 text-gray-500" />
          Platform Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">Manage global system configurations and integrations</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <nav className="flex flex-col">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab.id 
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mr-3 ${activeTab === tab.id ? 'text-blue-700' : 'text-gray-400'}`} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {saveMessage && (
              <div className={`mb-6 p-4 rounded-lg text-sm ${saveMessage.includes('Failed') ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
                {saveMessage}
              </div>
            )}
            
            {loading && Object.keys(localSettings).length === 0 ? (
              <div className="p-8 text-center text-gray-500">Loading settings...</div>
            ) : (
              <>
                {activeTab === 'COMPANY' && renderCompanySettings()}
                {activeTab === 'EMAIL' && renderEmailSettings()}
                {activeTab === 'SMS' && renderSmsSettings()}
                {(activeTab === 'BRAND' || activeTab === 'WHATSAPP' || activeTab === 'COMPLIANCE') && (
                  <div className="text-center p-12 text-gray-500">
                    <p>Settings panel for {activeTab} is under construction.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
