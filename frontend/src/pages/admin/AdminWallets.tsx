import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store/store';
import { fetchAdminWallets } from '../../features/admin/adminSlice';

const AdminWallets: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { wallets, loading } = useSelector((state: RootState) => state.admin);
    const [page, setPage] = useState(0);
    const [size] = useState(10);

    useEffect(() => {
        dispatch(fetchAdminWallets({ page, size }));
    }, [dispatch, page, size]);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Wallet Management</h1>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 text-sm border-b">
                        <tr>
                            <th className="p-4 font-medium">Wallet ID</th>
                            <th className="p-4 font-medium">User / Owner</th>
                            <th className="p-4 font-medium">Email</th>
                            <th className="p-4 font-medium text-right">Balance</th>
                            <th className="p-4 font-medium">Currency</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr>
                        ) : wallets.content.length === 0 ? (
                            <tr><td colSpan={5} className="p-4 text-center text-gray-500">No wallets found.</td></tr>
                        ) : (
                            wallets.content.map(wallet => (
                                <tr key={wallet.id} className="border-b last:border-0 hover:bg-gray-50">
                                    <td className="p-4 text-sm font-mono text-gray-600">W-{wallet.id.toString().padStart(6, '0')}</td>
                                    <td className="p-4 text-sm font-medium">{wallet.fullName}</td>
                                    <td className="p-4 text-sm text-gray-600">{wallet.userEmail}</td>
                                    <td className="p-4 text-sm text-right font-bold text-gray-900">{wallet.balance.toFixed(2)}</td>
                                    <td className="p-4 text-sm text-gray-500">{wallet.currency}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                <div className="p-4 border-t flex justify-between items-center bg-gray-50 text-sm">
                    <span className="text-gray-600">Total: {wallets.totalElements}</span>
                    <div className="flex space-x-2">
                        <button disabled={page === 0} onClick={() => setPage(page - 1)} className="px-3 py-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50">Previous</button>
                        <button disabled={page >= wallets.totalPages - 1} onClick={() => setPage(page + 1)} className="px-3 py-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminWallets;
