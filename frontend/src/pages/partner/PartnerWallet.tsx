import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store/store';
import { fetchWalletBalance, submitPartnerRecharge, fetchPartnerRecharges, partnerTransferFunds } from '../../features/wallet/walletSlice';
import { CreditCard, Send, PlusCircle, ArrowRightLeft, Clock, CheckCircle, XCircle } from 'lucide-react';

const PartnerWallet: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { balance, rechargeRequests, loading, error } = useSelector((state: RootState) => state.wallet);

    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'RECHARGE' | 'TRANSFER'>('OVERVIEW');

    // Recharge Form
    const [rechargeAmount, setRechargeAmount] = useState('');
    const [referenceNumber, setReferenceNumber] = useState('');

    // Transfer Form
    const [transferEmail, setTransferEmail] = useState('');
    const [transferAmount, setTransferAmount] = useState('');
    const [transferDescription, setTransferDescription] = useState('');

    // Success/Error Feedback
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchWalletBalance());
        dispatch(fetchPartnerRecharges({ page: 0, size: 20 }));
    }, [dispatch]);

    const handleRechargeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(submitPartnerRecharge({ amount: Number(rechargeAmount), referenceNumber }))
            .unwrap()
            .then(() => {
                setRechargeAmount('');
                setReferenceNumber('');
                setSuccessMessage('Recharge request submitted successfully!');
                dispatch(fetchPartnerRecharges({ page: 0, size: 20 }));
                setActiveTab('OVERVIEW');
                setTimeout(() => setSuccessMessage(null), 3000);
            })
            .catch((err) => {
                // error handled by redux state or we can set local error
            });
    };

    const handleTransferSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(partnerTransferFunds({ receiverEmail: transferEmail, amount: Number(transferAmount), description: transferDescription }))
            .unwrap()
            .then(() => {
                setTransferEmail('');
                setTransferAmount('');
                setTransferDescription('');
                setSuccessMessage('Transfer successful!');
                setActiveTab('OVERVIEW');
                setTimeout(() => setSuccessMessage(null), 3000);
            })
            .catch((err) => {
                // error handled by redux state
            });
    };

    return (
        <div className="space-y-6">
            {/* Header / Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Wallet & Transfers</h2>
                    <p className="text-slate-500 mt-1">Manage your funds, request recharges, and transfer to users.</p>
                </div>
                <div className="flex space-x-2 bg-slate-100 p-1 rounded-xl w-full md:w-auto">
                    {[
                        { id: 'OVERVIEW', label: 'Overview', icon: CreditCard },
                        { id: 'RECHARGE', label: 'Recharge', icon: PlusCircle },
                        { id: 'TRANSFER', label: 'Transfer', icon: Send },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                activeTab === tab.id 
                                    ? 'bg-white text-indigo-600 shadow-sm' 
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start space-x-3">
                    <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            {/* Success Display */}
            {successMessage && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl flex items-start space-x-3 animate-in fade-in slide-in-from-top-4 duration-300">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{successMessage}</span>
                </div>
            )}

            {/* Main Content Area */}
            {activeTab === 'OVERVIEW' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Balance Card */}
                    <div className="col-span-1 lg:col-span-1 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
                        <div className="relative z-10">
                            <p className="text-indigo-100 font-medium mb-1">Available Balance</p>
                            <h3 className="text-4xl font-bold tracking-tight">₹{balance?.toLocaleString() || '0.00'}</h3>
                            <div className="mt-8 flex space-x-3">
                                <button onClick={() => setActiveTab('RECHARGE')} className="flex-1 bg-white/20 hover:bg-white/30 transition text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-2">
                                    <PlusCircle className="w-4 h-4" />
                                    <span>Add Funds</span>
                                </button>
                                <button onClick={() => setActiveTab('TRANSFER')} className="flex-1 bg-white text-indigo-600 hover:bg-indigo-50 transition px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-2">
                                    <Send className="w-4 h-4" />
                                    <span>Transfer</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Recent Recharges */}
                    <div className="col-span-1 lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-800">Recent Recharge Requests</h3>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="p-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                                        <th className="p-3 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                                        <th className="p-3 text-xs font-semibold text-slate-500 uppercase">Reference</th>
                                        <th className="p-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {rechargeRequests?.content?.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-slate-500">No recharge requests found.</td>
                                        </tr>
                                    ) : (
                                        rechargeRequests?.content?.map((req) => (
                                            <tr key={req.id}>
                                                <td className="p-3 text-sm text-slate-600">{new Date(req.createdAt).toLocaleDateString()}</td>
                                                <td className="p-3 text-sm font-bold text-slate-800">₹{req.amount.toLocaleString()}</td>
                                                <td className="p-3 text-sm text-slate-500 font-mono">{req.referenceNumber}</td>
                                                <td className="p-3 text-sm">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                        req.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                                        req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                                                        'bg-rose-100 text-rose-700'
                                                    }`}>
                                                        {req.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'RECHARGE' && (
                <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <PlusCircle className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800">Request Wallet Recharge</h3>
                        <p className="text-slate-500 mt-2 text-sm">
                            Please transfer funds to the Admin Bank Account and enter the Reference/UTR number below for verification.
                        </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6 text-sm">
                        <p className="font-semibold text-slate-700 mb-2">Admin Bank Details:</p>
                        <ul className="space-y-1 text-slate-600">
                            <li><span className="font-medium">Bank:</span> FinTech Central Bank</li>
                            <li><span className="font-medium">A/C No:</span> 0000111122223333</li>
                            <li><span className="font-medium">IFSC:</span> FIN0000123</li>
                        </ul>
                    </div>

                    <form onSubmit={handleRechargeSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                            <input 
                                type="number" 
                                required min="100"
                                value={rechargeAmount}
                                onChange={(e) => setRechargeAmount(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                placeholder="Enter amount..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Reference Number / UTR</label>
                            <input 
                                type="text" 
                                required
                                value={referenceNumber}
                                onChange={(e) => setReferenceNumber(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                placeholder="e.g. UTR123456789"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] disabled:opacity-70"
                        >
                            {loading ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </form>
                </div>
            )}

            {activeTab === 'TRANSFER' && (
                <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Send className="w-8 h-8 ml-1" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800">Transfer Funds</h3>
                        <p className="text-slate-500 mt-2 text-sm">
                            Send money instantly to any customer using their email address.
                        </p>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 mb-6 text-sm text-amber-800">
                        <strong>Note:</strong> A standard platform commission of 1% will be deducted from your wallet in addition to the transfer amount.
                    </div>

                    <form onSubmit={handleTransferSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Customer Email</label>
                            <input 
                                type="email" 
                                required
                                value={transferEmail}
                                onChange={(e) => setTransferEmail(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                                placeholder="customer@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                            <input 
                                type="number" 
                                required min="1"
                                value={transferAmount}
                                onChange={(e) => setTransferAmount(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                                placeholder="Enter transfer amount..."
                            />
                            {transferAmount && (
                                <p className="text-xs text-slate-500 mt-2 text-right">
                                    Total Deduction (incl. 1% fee): <strong className="text-slate-700">₹{(Number(transferAmount) * 1.01).toFixed(2)}</strong>
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
                            <input 
                                type="text" 
                                value={transferDescription}
                                onChange={(e) => setTransferDescription(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                                placeholder="What's this for?"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] disabled:opacity-70"
                        >
                            {loading ? 'Processing...' : 'Send Money'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default PartnerWallet;
