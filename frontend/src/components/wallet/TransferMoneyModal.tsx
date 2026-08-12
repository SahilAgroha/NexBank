import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store/store';
import { transferFunds } from '../../features/wallet/walletSlice';
import { X } from 'lucide-react';

const transferSchema = z.object({
  receiverIdentifier: z.string().min(3, 'Receiver email or phone is required'),
  amount: z.number({ invalid_type_error: "Amount is required" }).min(1, 'Minimum amount is ₹1.00'),
  description: z.string().optional(),
});

type TransferForm = z.infer<typeof transferSchema>;

interface Props {
  onClose: () => void;
}

const TransferMoneyModal: React.FC<Props> = ({ onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<TransferForm>({
    resolver: zodResolver(transferSchema)
  });

  const onSubmit = async (data: TransferForm) => {
    try {
      await dispatch(transferFunds(data)).unwrap();
      alert('Transfer successful!');
      onClose();
    } catch (error: any) {
      alert(error || 'Transfer failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Money</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To (Email or Phone)</label>
            <input 
              {...register('receiverIdentifier')}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              placeholder="e.g. partner@fintech.com or 9876543210"
            />
            {errors.receiverIdentifier && <p className="text-red-500 text-xs mt-1">{errors.receiverIdentifier.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
            <input 
              {...register('amount', { valueAsNumber: true })}
              type="number"
              step="0.01"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-xl font-bold"
              placeholder="0.00"
            />
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note (Optional)</label>
            <input 
              {...register('description')}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              placeholder="What's this for?"
            />
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : 'Send Money'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferMoneyModal;
