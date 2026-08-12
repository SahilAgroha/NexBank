import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store/store';
import { fetchDashboardStats } from '../../features/partner/partnerSlice';
import { fetchActiveBanners, fetchPublishedNews } from '../../features/marketing/marketingSlice';
import { Users, DollarSign, TrendingUp, CreditCard, ChevronRight, ChevronLeft, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

const PartnerDashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { dashboardStats, loading } = useSelector((state: RootState) => state.partner);
  const { banners, news } = useSelector((state: RootState) => state.marketing);
  
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    dispatch(fetchDashboardStats());
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

  if (loading && !dashboardStats) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Partner Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back, {user?.fullName}. Manage your network and view your performance.</p>
      </div>

      {/* News Marquee */}
      {news.length > 0 && (
        <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 flex items-center shadow-sm">
          <div className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded mr-3 shrink-0 uppercase tracking-wider flex items-center">
             <Info className="w-3 h-3 mr-1" /> Updates
          </div>
          <div className="overflow-hidden whitespace-nowrap relative w-full">
            <div className="animate-marquee inline-block">
              {news.map((item, idx) => (
                <span key={item.id} className="text-purple-800 text-sm font-medium mx-4">
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

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { name: 'Current Balance', stat: `₹${dashboardStats?.currentWalletBalance?.toFixed(2) || '0.00'}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
          { name: 'Total Commission', stat: `₹${dashboardStats?.totalCommission?.toFixed(2) || '0.00'}`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-100' },
          { name: 'Total Customers', stat: dashboardStats?.totalCustomers?.toString() || '0', icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
          { name: 'Total Downline', stat: dashboardStats?.totalDownlinePartners?.toString() || '0', icon: Users, color: 'text-orange-600', bg: 'bg-orange-100' },
        ].map((item) => (
          <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg border border-gray-100 transition-transform hover:-translate-y-1 duration-300">
            <div className="p-5 flex items-center">
              <div className={`p-3 rounded-full ${item.bg}`}>
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500 truncate">{item.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6 border border-gray-100 min-h-[300px]">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Network Growth</h3>
          <p className="text-gray-400 text-sm text-center mt-20">Network activity chart will appear here</p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 border border-gray-100 min-h-[300px]">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Quick Links</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/partner/customers" className="p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition text-center flex flex-col items-center justify-center">
              <Users className="h-6 w-6 text-blue-500 mb-2" />
              <span className="text-sm font-medium text-gray-700">View Customers</span>
            </Link>
            <Link to="/partner/hierarchy" className="p-4 border rounded-lg hover:bg-green-50 hover:border-green-200 transition text-center flex flex-col items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-500 mb-2" />
              <span className="text-sm font-medium text-gray-700">My Network</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerDashboard;
