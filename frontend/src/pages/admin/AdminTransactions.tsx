import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store/store';
import { fetchAdminTransactions } from '../../features/admin/adminSlice';

const AdminTransactions: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { transactions, loading } = useSelector((state: RootState) => state.admin);
    const [page, setPage] = useState(0);
    const [size] = useState(10);

    useEffect(() => {
        dispatch(fetchAdminTransactions({ page, size }));
    }, [dispatch, page, size]);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Global Transactions</h1>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 text-sm border-b">
                        <tr>
                            <th className="p-4 font-medium">Date</th>
                            <th className="p-4 font-medium">Txn Ref</th>
                            <th className="p-4 font-medium">Sender</th>
                            <th className="p-4 font-medium">Receiver</th>
                            <th className="p-4 font-medium">Type</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium text-right">Amount (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} className="p-4 text-center">Loading...</td></tr>
                        ) : transactions.content.length === 0 ? (
                            <tr><td colSpan={7} className="p-4 text-center text-gray-500">No transactions found.</td></tr>
                        ) : (
                            transactions.content.map(txn => (
                                <tr key={txn.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                                    <td className="p-4 text-xs whitespace-nowrap text-gray-500">{new Date(txn.createdAt).toLocaleString()}</td>
                                    <td className="p-4 text-sm font-mono text-gray-600">{txn.referenceNumber}</td>
                                    <td className="p-4 text-xs text-gray-700">{txn.senderEmail || 'SYSTEM'}</td>
                                    <td className="p-4 text-xs text-gray-700">{txn.receiverEmail || 'SYSTEM'}</td>
                                    <td className="p-4 text-sm">
                                        <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600 font-medium">
                                            {txn.type}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            txn.status === 'SUCCESS' ? 'bg-green-100 text-green-700' :
                                            txn.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {txn.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-right font-bold text-gray-900">{txn.amount.toFixed(2)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                <div className="p-4 border-t flex justify-between items-center bg-gray-50 text-sm">
                    <span className="text-gray-600">Total: {transactions.totalElements}</span>
                    <div className="flex space-x-2">
                        <button disabled={page === 0} onClick={() => setPage(page - 1)} className="px-3 py-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50">Previous</button>
                        <button disabled={page >= transactions.totalPages - 1} onClick={() => setPage(page + 1)} className="px-3 py-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminTransactions;
