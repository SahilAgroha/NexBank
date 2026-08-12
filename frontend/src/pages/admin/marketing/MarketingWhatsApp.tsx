import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MessageCircle, Send } from 'lucide-react';
import type { AppDispatch, RootState } from '../../../store/store';
import { fetchAdminUsers } from '../../../features/admin/adminSlice';
import { sendWhatsAppMessage, fetchMarketingHistory } from '../../../features/marketing/marketingSlice';

const MarketingWhatsApp = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users } = useSelector((state: RootState) => state.admin);
  const { messageHistory } = useSelector((state: RootState) => state.marketing);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchAdminUsers({ page: 0, size: 100 })); // Fetch users for dropdown
    dispatch(fetchMarketingHistory('WHATSAPP'));
  }, [dispatch]);

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  };

  const handleSend = async () => {
    if (selectedUsers.length === 0 || !message) return;
    setLoading(true);
    await dispatch(sendWhatsAppMessage({ userIds: selectedUsers, message }));
    await dispatch(fetchMarketingHistory('WHATSAPP'));
    setLoading(false);
    setMessage('');
    setSelectedUsers([]);
    alert("WhatsApp campaign successfully sent! (Check backend logs for details)");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-green-100 rounded-lg">
          <MessageCircle className="w-6 h-6 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">WhatsApp Marketing</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Audience Selection */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Audience</h2>
            <div className="border border-gray-200 rounded-lg h-80 overflow-y-auto">
              {users.content.map(user => (
                <label key={user.id} className="flex items-center p-3 hover:bg-gray-50 border-b border-gray-100 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => toggleUserSelection(user.id)}
                    className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500" 
                  />
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">{user.fullName}</div>
                    <div className="text-xs text-gray-500">{user.phone} ({user.role})</div>
                  </div>
                </label>
              ))}
            </div>
            <div className="mt-2 text-sm text-gray-500">
              {selectedUsers.length} user(s) selected
            </div>
          </div>

          {/* Message Composer */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Compose Message</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message Body</label>
                <textarea 
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Hello {{name}}, we have a special offer for you..."
                  className="w-full h-48 bg-gray-50 border border-gray-200 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <button 
                onClick={handleSend}
                disabled={loading || selectedUsers.length === 0 || !message}
                className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
                <span>{loading ? 'Sending Campaign...' : 'Send WhatsApp Campaign'}</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">WhatsApp Campaign History</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
            <tr>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Message Body</th>
              <th className="px-6 py-3 font-medium">Recipients</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {messageHistory.map(history => (
              <tr key={history.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{new Date(history.sentAt).toLocaleString()}</td>
                <td className="px-6 py-4 text-gray-600 truncate max-w-sm">{history.message}</td>
                <td className="px-6 py-4">{history.recipientCount} users</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${history.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {history.status}
                  </span>
                </td>
              </tr>
            ))}
            {messageHistory.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No WhatsApp campaigns sent yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MarketingWhatsApp;
