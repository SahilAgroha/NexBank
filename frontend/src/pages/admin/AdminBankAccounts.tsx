import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store/store';
import { fetchSystemBankAccounts, createSystemBankAccount, toggleSystemBankAccount, deleteSystemBankAccount } from '../../features/admin/customerManagementSlice';
import { Building2, Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';

const AdminBankAccounts = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { systemBankAccounts, loading } = useSelector((state: RootState) => state.customerManagement);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newAccount, setNewAccount] = useState({ accountName: '', bankName: '', accountNumber: '', ifscCode: '' });

    useEffect(() => {
        dispatch(fetchSystemBankAccounts());
    }, [dispatch]);

    const handleCreate = () => {
        if (!newAccount.accountName || !newAccount.bankName || !newAccount.accountNumber || !newAccount.ifscCode) return;
        dispatch(createSystemBankAccount(newAccount));
        setIsModalOpen(false);
        setNewAccount({ accountName: '', bankName: '', accountNumber: '', ifscCode: '' });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">System Bank Accounts</h1>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center space-x-2 bg-[#1C1C1E] text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span>Link New Account</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                    <input type="text" placeholder="Search by bank name or holder name..." className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    {systemBankAccounts.map(account => (
                        <div key={account.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Building2 className="w-5 h-5 text-blue-600" />
                                </div>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${account.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {account.active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 uppercase">{account.accountName}</h3>
                            <p className="text-sm text-gray-500 mb-4">{account.bankName}</p>
                            
                            <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between mb-4">
                                <span className="font-mono text-gray-700 tracking-wider">{account.accountNumber}</span>
                                <span className="text-xs font-semibold text-gray-500">{account.ifscCode}</span>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <button 
                                    onClick={() => dispatch(toggleSystemBankAccount(account.id))}
                                    className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                                    title={account.active ? "Deactivate" : "Activate"}
                                >
                                    {account.active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                </button>
                                <button 
                                    onClick={() => dispatch(deleteSystemBankAccount(account.id))}
                                    className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {systemBankAccounts.length === 0 && !loading && (
                        <div className="col-span-full py-12 text-center text-gray-500">
                            No bank accounts linked yet.
                        </div>
                    )}
                </div>
            </div>

            {/* Link New Account Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Link New Account</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
                                <input type="text" value={newAccount.accountName} onChange={e => setNewAccount({...newAccount, accountName: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                                <input type="text" value={newAccount.bankName} onChange={e => setNewAccount({...newAccount, bankName: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                                <input type="text" value={newAccount.accountNumber} onChange={e => setNewAccount({...newAccount, accountNumber: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                                <input type="text" value={newAccount.ifscCode} onChange={e => setNewAccount({...newAccount, ifscCode: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                            <button onClick={handleCreate} className="px-4 py-2 bg-[#1C1C1E] text-white rounded-lg hover:bg-gray-800">Link Account</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBankAccounts;
