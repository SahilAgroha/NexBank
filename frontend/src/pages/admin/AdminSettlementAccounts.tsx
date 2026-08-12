import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store/store';
import { fetchSettlementAccounts, updateSettlementAccountStatus } from '../../features/admin/customerManagementSlice';
import { Wallet, Check, X } from 'lucide-react';

const AdminSettlementAccounts = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { settlementAccounts, loading } = useSelector((state: RootState) => state.customerManagement);

    useEffect(() => {
        dispatch(fetchSettlementAccounts());
    }, [dispatch]);

    const handleUpdateStatus = (id: number, status: string) => {
        dispatch(updateSettlementAccountStatus({ id, status }));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <Wallet className="w-6 h-6 text-purple-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Settlement Registry</h1>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button className="text-sm font-semibold text-gray-900 border-b-2 border-gray-900 pb-1">All Accounts</button>
                        <button className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors pb-1">Active</button>
                        <button className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors pb-1">Inactive</button>
                    </div>
                    <div className="w-64">
                        <input type="text" placeholder="Search merchant profile..." className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                                <th className="p-4 font-semibold">ID</th>
                                <th className="p-4 font-semibold">Institution</th>
                                <th className="p-4 font-semibold">Account Metadata</th>
                                <th className="p-4 font-semibold">IFSC & Contact</th>
                                <th className="p-4 font-semibold">Merchant Owner</th>
                                <th className="p-4 font-semibold text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {settlementAccounts.map((account) => (
                                <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-mono text-sm text-gray-600">#{account.id}</td>
                                    <td className="p-4 font-medium text-gray-900">{account.institution}</td>
                                    <td className="p-4 font-mono text-sm text-gray-600 tracking-wide">{account.accountMetadata}</td>
                                    <td className="p-4 text-sm text-gray-600">{account.ifscAndContact}</td>
                                    <td className="p-4 text-sm font-medium text-gray-900">
                                        {account.merchantName} <span className="text-gray-400 text-xs ml-1">(#{account.merchantId})</span>
                                    </td>
                                    <td className="p-4 text-right">
                                        {account.status === 'PENDING' ? (
                                            <div className="flex items-center justify-end space-x-2">
                                                <button 
                                                    onClick={() => handleUpdateStatus(account.id, 'APPROVED')}
                                                    className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100" title="Approve"
                                                ><Check className="w-4 h-4" /></button>
                                                <button 
                                                    onClick={() => handleUpdateStatus(account.id, 'REJECTED')}
                                                    className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100" title="Reject"
                                                ><X className="w-4 h-4" /></button>
                                            </div>
                                        ) : (
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${account.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {account.status}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {settlementAccounts.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">
                                        Select a merchant profile to analyze settlement nodes, or no accounts found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminSettlementAccounts;
