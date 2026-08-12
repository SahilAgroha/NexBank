import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../store/store';
import { fetchAdminWallets, adjustWalletBalance } from '../../../features/admin/adminSlice';
import { ArrowDownLeft, ArrowUpRight, Search } from 'lucide-react';

const WalletTransfers: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { wallets, loading } = useSelector((state: RootState) => state.admin);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedWallet, setSelectedWallet] = useState<any>(null);
    const [adjustmentForm, setAdjustmentForm] = useState({
        amount: '',
        type: 'CREDIT' as 'CREDIT' | 'DEBIT',
        remark: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        dispatch(fetchAdminWallets({ page: 0, size: 50 }));
    }, [dispatch]);

    const filteredWallets = wallets.content.filter(w => 
        w.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        w.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedWallet) return;
        if (Number(adjustmentForm.amount) <= 0) {
            alert('Amount must be greater than 0');
            return;
        }
        if (adjustmentForm.type === 'DEBIT' && Number(adjustmentForm.amount) > selectedWallet.balance) {
            alert('Insufficient balance for debit adjustment.');
            return;
        }

        if (!window.confirm(`Are you sure you want to ${adjustmentForm.type} ₹${adjustmentForm.amount} to ${selectedWallet.fullName}'s wallet?`)) {
            return;
        }

        setIsSubmitting(true);
        try {
            await dispatch(adjustWalletBalance({
                walletId: selectedWallet.id,
                amount: Number(adjustmentForm.amount),
                type: adjustmentForm.type,
                remark: adjustmentForm.remark || `Manual ${adjustmentForm.type} by Admin`
            })).unwrap();
            
            alert('Wallet adjusted successfully!');
            setAdjustmentForm({ amount: '', type: 'CREDIT', remark: '' });
            setSelectedWallet(null);
            dispatch(fetchAdminWallets({ page: 0, size: 50 }));
        } catch (err: any) {
            alert(err || 'Failed to adjust wallet');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 flex items-center">
                        <span className="w-8 h-8 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">💰</span>
                        Inventory Control / Wallet Authorization
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Manually credit or debit partner wallets for offline adjustments or corrections</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Side - Wallet Selection */}
                <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6 flex flex-col h-[600px]">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Select Wallet</h2>
                    
                    <div className="relative mb-6">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-500" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {loading && wallets.content.length === 0 ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
                            </div>
                        ) : filteredWallets.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 text-sm">
                                No wallets found.
                            </div>
                        ) : (
                            filteredWallets.map(wallet => (
                                <div 
                                    key={wallet.id}
                                    onClick={() => setSelectedWallet(wallet)}
                                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                        selectedWallet?.id === wallet.id 
                                        ? 'border-indigo-500 bg-indigo-50' 
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-gray-900 font-medium">{wallet.fullName}</h3>
                                            <p className="text-xs text-gray-500">{wallet.userEmail}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500 mb-1">Current Balance</p>
                                            <p className="text-sm font-bold text-emerald-600">₹{wallet.balance.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Side - Adjustment Form */}
                <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6 h-[600px] flex flex-col">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Process Adjustment</h2>
                    
                    {!selectedWallet ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
                            <ArrowDownLeft className="h-12 w-12 text-gray-300 mb-4" />
                            <p>Select a wallet from the list to process an adjustment.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-6">
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-center">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Selected Partner</p>
                                    <p className="text-gray-900 font-bold mt-1">{selectedWallet.fullName}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Available Balance</p>
                                    <p className="text-emerald-600 font-bold mt-1">₹{selectedWallet.balance.toFixed(2)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setAdjustmentForm({ ...adjustmentForm, type: 'CREDIT' })}
                                    className={`flex items-center justify-center gap-2 p-4 rounded-lg border transition-all ${
                                        adjustmentForm.type === 'CREDIT'
                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold'
                                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 font-medium'
                                    }`}
                                >
                                    <ArrowDownLeft size={20} />
                                    <span>Credit Wallet</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAdjustmentForm({ ...adjustmentForm, type: 'DEBIT' })}
                                    className={`flex items-center justify-center gap-2 p-4 rounded-lg border transition-all ${
                                        adjustmentForm.type === 'DEBIT'
                                        ? 'border-rose-500 bg-rose-50 text-rose-700 font-bold'
                                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 font-medium'
                                    }`}
                                >
                                    <ArrowUpRight size={20} />
                                    <span>Debit Wallet</span>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (₹)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        required
                                        value={adjustmentForm.amount}
                                        onChange={(e) => setAdjustmentForm({ ...adjustmentForm, amount: e.target.value })}
                                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:border-indigo-500 font-mono text-lg font-bold"
                                        placeholder="0.00"
                                    />
                                    {adjustmentForm.type === 'DEBIT' && Number(adjustmentForm.amount) > selectedWallet.balance && (
                                        <p className="text-xs text-rose-600 mt-2">Error: Amount exceeds available balance.</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Remarks / Authorization Note</label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={adjustmentForm.remark}
                                        onChange={(e) => setAdjustmentForm({ ...adjustmentForm, remark: e.target.value })}
                                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-sm text-gray-900 focus:outline-none focus:border-indigo-500"
                                        placeholder="Enter reason for adjustment..."
                                    ></textarea>
                                </div>
                            </div>

                            <div className="pt-4 mt-auto">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || (adjustmentForm.type === 'DEBIT' && Number(adjustmentForm.amount) > selectedWallet.balance)}
                                    className={`w-full py-4 px-4 rounded-lg font-medium text-white transition-all ${
                                        adjustmentForm.type === 'CREDIT' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {isSubmitting ? 'Processing...' : `Confirm ${adjustmentForm.type} of ₹${adjustmentForm.amount || '0'}`}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WalletTransfers;
