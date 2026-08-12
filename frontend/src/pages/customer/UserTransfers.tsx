import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../store/store';
import { transferFunds, fetchWalletBalance, fetchTransactions } from '../../features/wallet/walletSlice';
import { CreditCard, Send, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import api from '../../api/api';

const UserTransfers = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('action') === 'send' ? 'send' : 'add';
  const [activeTab, setActiveTab] = useState<'add' | 'send'>(initialTab);
  
  const [addAmount, setAddAmount] = useState('');
  const [sendIdentifier, setSendIdentifier] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [sendNote, setSendNote] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const res = await api.get('/users/profile');
        setProfile(res.data.data);
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };
    getProfile();
  }, []);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addAmount || Number(addAmount) <= 0) return;
    
    setIsLoading(true);
    try {
      const res = await loadRazorpayScript();
      if (!res) {
        throw new Error('Razorpay SDK failed to load. Are you online?');
      }

      const orderResponse = await api.post('/payments/create-order', { amount: Number(addAmount) });
      const orderId = orderResponse.data.data.orderId;
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummy',
        amount: Number(addAmount) * 100,
        currency: 'INR',
        name: 'FinTech Platform',
        description: 'Wallet Recharge',
        order_id: orderId,
        handler: async function (response: any) {
          try {
            await api.post(`/payments/verify?amount=${Number(addAmount)}`, {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
            alert('Payment successful and wallet recharged!');
            setAddAmount('');
            dispatch(fetchWalletBalance());
            dispatch(fetchTransactions());
          } catch (err: any) {
            alert('Verification failed: ' + (err.response?.data?.message || err.message));
          }
        },
        prefill: {
          name: profile?.fullName || user?.fullName || '',
          email: profile?.email || user?.email || '',
          contact: profile?.phone || '9999999999',
        },
        theme: {
          color: '#4f46e5'
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', async function (response: any) {
        alert(response.error.description);
        try {
          await api.post('/payments/fail', {
            razorpayOrderId: response.error.metadata?.order_id,
            razorpayPaymentId: response.error.metadata?.payment_id,
            errorMessage: response.error.description,
            paymentMethod: response.error.method || response.error.source || 'UNKNOWN'
          });
        } catch (e) {
          console.error("Failed to log payment failure to backend", e);
        }
      });
      rzp.open();
    } catch (error: any) {
      alert(error.response?.data?.message || error.message || 'Failed to initiate payment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendIdentifier || !sendAmount || Number(sendAmount) <= 0) return;
    
    setIsLoading(true);
    try {
      await dispatch(transferFunds({
        receiverIdentifier: sendIdentifier,
        amount: Number(sendAmount),
        description: sendNote
      })).unwrap();
      alert('Transfer successful!');
      setSendIdentifier('');
      setSendAmount('');
      setSendNote('');
    } catch (error: any) {
      alert(error || 'Transfer failed');
    } finally {
      setIsLoading(false);
    }
  };

  const isKycApproved = profile?.kycStatus === 'APPROVED';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 font-sans">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Money Transfers</h1>
        <p className="text-gray-500 text-base max-w-lg mx-auto">Add funds to your digital wallet instantly or send money to friends and family with zero fees.</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 p-1.5 rounded-2xl inline-flex shadow-inner">
          <button
            onClick={() => { setActiveTab('add'); setSearchParams({ action: 'add' }); }}
            className={`flex items-center px-6 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'add' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Add Money
          </button>
          <button
            onClick={() => { setActiveTab('send'); setSearchParams({ action: 'send' }); }}
            className={`flex items-center px-6 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'send' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Send className="w-4 h-4 mr-2" />
            Send Money
          </button>
        </div>
      </div>

      {!isKycApproved && profile && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-6 py-4 rounded-2xl flex items-center shadow-sm">
          <ShieldCheck className="w-6 h-6 mr-3 text-amber-500" />
          <div>
            <h4 className="font-bold">Identity Verification Required</h4>
            <p className="text-sm mt-0.5">You must complete your KYC to unlock add and send money features.</p>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-50 opacity-50 rounded-full blur-3xl"></div>
        
        {activeTab === 'add' && (
          <div className="p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                <CreditCard className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Add funds to Wallet</h2>
                <p className="text-gray-500 text-sm mt-1">Via UPI, Netbanking, or Credit/Debit Card</p>
              </div>
            </div>

            <form onSubmit={handleAddMoney} className="space-y-6 max-w-md">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Amount (₹)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400 font-bold text-xl">₹</span>
                  </div>
                  <input 
                    type="number"
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                    disabled={!isKycApproved}
                    className="block w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-2xl font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-50"
                    placeholder="0.00"
                  />
                </div>
                <div className="flex space-x-2 mt-3">
                  {[500, 1000, 5000].map(amt => (
                    <button 
                      key={amt}
                      type="button"
                      disabled={!isKycApproved}
                      onClick={() => setAddAmount(amt.toString())}
                      className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50"
                    >
                      +₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={isLoading || !isKycApproved || !addAmount}
                  className="w-full flex justify-center items-center py-4 px-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Processing...' : `Proceed to Pay ₹${addAmount || '0'}`}
                  {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
                </button>
              </div>
              <p className="text-center text-xs text-gray-400 font-medium flex items-center justify-center">
                <ShieldCheck className="w-3 h-3 mr-1" />
                Secured by Razorpay
              </p>
            </form>
          </div>
        )}

        {activeTab === 'send' && (
          <div className="p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <Send className="w-7 h-7 ml-1" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Send Money</h2>
                <p className="text-gray-500 text-sm mt-1">Instant, zero-fee transfers to any user.</p>
              </div>
            </div>

            <form onSubmit={handleSendMoney} className="space-y-6 max-w-md">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Recipient</label>
                <input 
                  type="text"
                  value={sendIdentifier}
                  onChange={(e) => setSendIdentifier(e.target.value)}
                  disabled={!isKycApproved}
                  className="block w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-base font-semibold text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50"
                  placeholder="Email or Phone Number"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Amount (₹)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400 font-bold text-xl">₹</span>
                  </div>
                  <input 
                    type="number"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    disabled={!isKycApproved}
                    className="block w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-2xl font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Note (Optional)</label>
                <input 
                  type="text"
                  value={sendNote}
                  onChange={(e) => setSendNote(e.target.value)}
                  disabled={!isKycApproved}
                  className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50"
                  placeholder="What's this for?"
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={isLoading || !isKycApproved || !sendAmount || !sendIdentifier}
                  className="w-full flex justify-center items-center py-4 px-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending...' : `Send ₹${sendAmount || '0'} Instantly`}
                  {!isLoading && <Zap className="w-5 h-5 ml-2" />}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default UserTransfers;
