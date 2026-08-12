import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store/store';
import { fetchWalletBalance, fetchTransactions } from '../../features/wallet/walletSlice';
import { fetchNotifications, markAsRead } from '../../features/notification/notificationSlice';
import { fetchActiveBanners, fetchPublishedNews } from '../../features/marketing/marketingSlice';
import { ArrowUpRight, ArrowDownLeft, Send, Plus, Bell, User as UserIcon, Check, ChevronRight, ChevronLeft, Info } from 'lucide-react';
import TransferMoneyModal from '../../components/wallet/TransferMoneyModal';
import RechargeMoneyModal from '../../components/wallet/RechargeMoneyModal';
import api from '../../api/api';

const CustomerDashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { balance, transactions, loading } = useSelector((state: RootState) => state.wallet);
  const { user } = useSelector((state: RootState) => state.auth);
  const { notifications } = useSelector((state: RootState) => state.notification);
  const { banners, news } = useSelector((state: RootState) => state.marketing);
  
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  
  const [profile, setProfile] = useState<any>(null);

  const fetchData = async () => {
    try {
      const profileRes = await api.get('/users/profile');
      setProfile(profileRes.data.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    }
  };

  useEffect(() => {
    dispatch(fetchWalletBalance());
    dispatch(fetchTransactions());
    fetchData();
    dispatch(fetchNotifications());
    dispatch(fetchActiveBanners('DASHBOARD'));
    dispatch(fetchPublishedNews());
  }, [dispatch]);

  // Auto-slide banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const handleMarkAsRead = (id: number) => {
    dispatch(markAsRead(id));
  };

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6">

      {/* News Marquee */}
      {news.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-center shadow-sm">
          <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded mr-3 shrink-0 uppercase tracking-wider flex items-center">
             <Info className="w-3 h-3 mr-1" /> Updates
          </div>
          <div className="overflow-hidden whitespace-nowrap relative w-full">
            <div className="animate-marquee inline-block">
              {news.map((item, idx) => (
                <span key={item.id} className="text-blue-800 text-sm font-medium mx-4">
                  • {item.title}: <span className="font-normal">{item.content}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Banners Carousel */}
      {banners.length > 0 && (
        <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden shadow-sm group">
          {banners.map((banner, index) => (
            <a 
              key={banner.id}
              href={banner.targetUrl || '#'}
              className={`absolute inset-0 transition-opacity duration-1000 ${index === currentBannerIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              target={banner.targetUrl ? '_blank' : '_self'}
              rel="noreferrer"
            >
              <img 
                src={banner.imageUrl.startsWith('http') ? banner.imageUrl : `http://localhost:8080${banner.imageUrl}`} 
                alt={banner.title} 
                className="w-full h-full object-cover"
              />
            </a>
          ))}
          
          {banners.length > 1 && (
            <>
              <button 
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setCurrentBannerIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1))}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setCurrentBannerIndex((prev) => (prev + 1) % banners.length)}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                {banners.map((_, idx) => (
                  <button 
                    key={idx} 
                    className={`h-1.5 rounded-full transition-all ${idx === currentBannerIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                    onClick={() => setCurrentBannerIndex(idx)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Top Row: Profile & Wallet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-1">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <UserIcon className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{profile?.fullName || user?.fullName || 'Loading...'}</h3>
              <p className="text-sm text-gray-500">{profile?.email || user?.email}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Phone:</strong> {profile?.phone || 'N/A'}</p>
            <p><strong>Role:</strong> {profile?.role}</p>
            <p><strong>Status:</strong> <span className="text-green-600 font-medium">Active</span></p>
          </div>
        </div>

        {/* Wallet Overview Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col justify-between lg:col-span-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 font-medium mb-1">Total Balance</p>
              <h2 className="text-4xl font-bold text-gray-900">
                ₹{loading ? '...' : balance.toFixed(2)}
              </h2>
            </div>
          </div>
          <div className="flex gap-4 mt-6">
            <button 
              onClick={() => setIsRechargeModalOpen(true)}
              disabled={profile?.kycStatus !== 'APPROVED'}
              className={`flex-1 flex justify-center items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
                profile?.kycStatus === 'APPROVED' 
                  ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-70'
              }`}
              title={profile?.kycStatus !== 'APPROVED' ? 'Please complete KYC first' : ''}
            >
              <Plus className="h-5 w-5" />
              Add Money
            </button>
            <button 
              onClick={() => setIsTransferModalOpen(true)}
              disabled={profile?.kycStatus !== 'APPROVED'}
              className={`flex-1 flex justify-center items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors shadow-lg ${
                profile?.kycStatus === 'APPROVED' 
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none opacity-70'
              }`}
              title={profile?.kycStatus !== 'APPROVED' ? 'Please complete KYC first' : ''}
            >
              <Send className="h-5 w-5" />
              Send Money
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transactions List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800">Recent Transactions</h3>
          </div>
          
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No transactions yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentTransactions.map((trx, idx) => {
                const isSender = trx.senderName === user?.fullName;
                const isDebit = (isSender && trx.type === 'TRANSFER') || trx.type === 'WITHDRAWAL';
                
                return (
                  <div key={idx} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isDebit ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {isDebit ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {trx.type === 'TRANSFER' 
                            ? (isDebit ? `Sent to ${trx.receiverName}` : `Received from ${trx.senderName}`)
                            : trx.type}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(trx.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${isDebit ? 'text-gray-900' : 'text-green-600'}`}>
                        {isDebit ? '-' : '+'}₹{trx.amount.toFixed(2)}
                      </p>
                      <p className={`text-xs font-medium ${trx.status === 'SUCCESS' ? 'text-green-500' : 'text-red-500'}`}>
                        {trx.status}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-800">Notifications</h3>
            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
              {notifications.filter(n => !n.read).length} Unread
            </span>
          </div>
          
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500 flex flex-col items-center">
              <Bell className="h-8 w-8 text-gray-300 mb-2" />
              You're all caught up!
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.slice(0, 5).map((notif, idx) => (
                <div key={idx} className={`p-6 flex items-start justify-between transition-colors ${notif.read ? 'bg-white' : 'bg-blue-50/50'}`}>
                  <div className="flex gap-4">
                    <div className={`mt-1 h-2 w-2 rounded-full ${notif.read ? 'bg-transparent' : 'bg-blue-600'}`} />
                    <div>
                      <h4 className={`text-sm ${notif.read ? 'font-medium text-gray-700' : 'font-bold text-gray-900'}`}>
                        {notif.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-2">{new Date(notif.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  {!notif.read && (
                    <button onClick={() => handleMarkAsRead(notif.id)} className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors" title="Mark as read">
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isTransferModalOpen && (
        <TransferMoneyModal onClose={() => setIsTransferModalOpen(false)} />
      )}
      
      {isRechargeModalOpen && (
        <RechargeMoneyModal onClose={() => setIsRechargeModalOpen(false)} />
      )}
    </div>
  );
};

export default CustomerDashboard;
