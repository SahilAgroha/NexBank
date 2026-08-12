import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X } from 'lucide-react';
import type { AppDispatch, RootState } from '../../store/store';
import { fetchWalletBalance, fetchTransactions } from '../../features/wallet/walletSlice';
import api from '../../api/api';

interface Props {
  onClose: () => void;
}

const RechargeMoneyModal: React.FC<Props> = ({ onClose }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const res = await loadRazorpayScript();
      if (!res) {
        throw new Error('Razorpay SDK failed to load. Are you online?');
      }

      const orderResponse = await api.post('/payments/create-order', { amount: numAmount });
      const orderId = orderResponse.data.data.orderId;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummy',
        amount: numAmount * 100,
        currency: 'INR',
        name: 'Fintech Platform',
        description: 'Wallet Recharge',
        order_id: orderId,
        handler: async function (response: any) {
          try {
            await api.post(`/payments/verify?amount=${numAmount}`, {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
            
            // Refresh wallet on the dashboard
            dispatch(fetchWalletBalance());
            dispatch(fetchTransactions());
          } catch (verifyError: any) {
            alert(verifyError.response?.data?.message || "Payment verification failed");
          }
        },
        prefill: {
          name: user?.fullName,
          email: user?.email,
          contact: '9999999999'
        },
        theme: {
          color: '#2563eb'
        }
      };

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.on('payment.failed', async function (response: any){
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
      rzp1.open();
      
      // Close the modal immediately so Razorpay handles the rest on top of the dashboard!
      onClose();

    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to initialize payment');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50">
      <div className="relative w-full max-w-md p-8 mx-4 bg-white rounded-2xl shadow-xl transition-all duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Money to Wallet</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (₹)
            </label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {loading ? 'Initializing Gateway...' : 'Pay with Razorpay'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RechargeMoneyModal;
