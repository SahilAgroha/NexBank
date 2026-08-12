import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../store/store';
import { fetchWalletBalance, fetchTransactions } from '../../features/wallet/walletSlice';
import { CreditCard, ArrowUpRight, ArrowDownLeft, Plus, Send, Activity, ShieldCheck, Zap } from 'lucide-react';
import api from '../../api/api';

const UserWallet = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { balance, transactions, loading } = useSelector((state: RootState) => state.wallet);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchWalletBalance());
    dispatch(fetchTransactions());
    const getProfile = async () => {
      try {
        const res = await api.get('/users/profile');
        setProfile(res.data.data);
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };
    getProfile();
  }, [dispatch]);

  const recentTransactions = transactions.slice(0, 4);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Wallet</h1>
          <p className="text-gray-500 mt-2 text-base">Manage your funds and digital cards securely.</p>
        </div>
        <div className="hidden md:flex items-center space-x-2 text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 mt-4 md:mt-0">
          <ShieldCheck className="w-4 h-4" />
          <span>Bank-level Security Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Digital Card & Actions */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Digital Card */}
          <div className="relative rounded-3xl p-8 overflow-hidden shadow-2xl transition-transform hover:scale-[1.01] duration-300 cursor-pointer bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-indigo-500 opacity-20 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 flex justify-between items-start mb-12">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-6 h-6 text-indigo-300" />
                <span className="font-semibold tracking-widest text-indigo-200">FINTECH PLATFORM</span>
              </div>
              <div className="flex space-x-1">
                <div className="w-8 h-8 rounded-full bg-white opacity-20"></div>
                <div className="w-8 h-8 rounded-full bg-white opacity-40 -ml-4"></div>
              </div>
            </div>

            <div className="relative z-10 space-y-1">
              <p className="text-indigo-200 font-medium text-sm">Available Balance</p>
              <h2 className="text-5xl font-extrabold tracking-tight">
                ₹{loading ? '...' : balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>

            <div className="relative z-10 flex justify-between items-end mt-12">
              <div>
                <p className="text-xs text-indigo-300 uppercase tracking-widest mb-1">Card Holder</p>
                <p className="font-semibold tracking-wide text-lg">{user?.fullName?.toUpperCase() || 'VALUED MEMBER'}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-indigo-300 uppercase tracking-widest mb-1">Status</p>
                <p className="font-semibold text-emerald-400">ACTIVE</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-amber-500" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => navigate('/user/transfers?action=add')}
                className="flex flex-col items-center justify-center p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-100 transition-all group"
              >
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="font-bold text-gray-900">Add Money</span>
                <span className="text-xs text-gray-500 mt-1 text-center">Via UPI or Card</span>
              </button>
              
              <button 
                onClick={() => navigate('/user/transfers?action=send')}
                className="flex flex-col items-center justify-center p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:indigo-100 transition-all group"
              >
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Send className="w-6 h-6 ml-1" />
                </div>
                <span className="font-bold text-gray-900">Send Money</span>
                <span className="text-xs text-gray-500 mt-1 text-center">To friends & family</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Mini Activity Feed */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-gray-400" />
                Recent Activity
              </h3>
              <button 
                onClick={() => navigate('/user/transactions')}
                className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                See All
              </button>
            </div>

            <div className="flex-1">
              {transactions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-10 opacity-60">
                  <Activity className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">No recent activity</p>
                  <p className="text-xs text-gray-400 mt-1">Your transactions will appear here.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {recentTransactions.map((trx, idx) => {
                    const isSender = trx.senderName === user?.fullName;
                    const isDebit = (isSender && trx.type === 'TRANSFER') || trx.type === 'WITHDRAWAL';
                    const amountStr = `₹${trx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
                    
                    return (
                      <div key={idx} className="flex items-center justify-between group">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${
                            isDebit ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            {isDebit ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-gray-900 truncate">
                              {trx.type === 'TRANSFER' 
                                ? (isDebit ? `Sent to ${trx.receiverName}` : `Received from ${trx.senderName}`)
                                : trx.description || trx.type}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 truncate font-medium">
                              {new Date(trx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 pl-2">
                          <p className={`font-bold text-sm ${isDebit ? 'text-gray-900' : 'text-emerald-600'}`}>
                            {isDebit ? '-' : '+'}{amountStr}
                          </p>
                          <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${trx.status === 'SUCCESS' ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {trx.status}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* KYC Warning banner if needed */}
            {profile && profile.kycStatus !== 'APPROVED' && (
              <div className="mt-8 bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start">
                <AlertCircle className="w-5 h-5 text-amber-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-amber-900">Verification Required</h4>
                  <p className="text-xs text-amber-700 mt-1">Please complete KYC to unlock full wallet limits.</p>
                  <button onClick={() => navigate('/user/kyc')} className="mt-2 text-xs font-bold text-amber-800 hover:underline">Complete now &rarr;</button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserWallet;
