import React from 'react';
import type { AdminTransaction } from '../../features/admin/adminSlice';

interface LedgerTableProps {
    transactions: AdminTransaction[];
}

const LedgerTable: React.FC<LedgerTableProps> = ({ transactions }) => {
    return (
        <div className="bg-white border border-gray-100 shadow-sm rounded-lg overflow-hidden mt-6">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-medium">Date</th>
                            <th className="px-6 py-4 font-medium">Reference</th>
                            <th className="px-6 py-4 font-medium">Type</th>
                            <th className="px-6 py-4 font-medium">Description</th>
                            <th className="px-6 py-4 font-medium text-right">Amount (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    No records found for this period.
                                </td>
                            </tr>
                        ) : (
                            transactions.map((tx) => (
                                <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-800">
                                        {new Date(tx.createdAt).toLocaleDateString()} <span className="text-xs text-gray-400 ml-1">{new Date(tx.createdAt).toLocaleTimeString()}</span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs">{tx.referenceNumber}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                                            tx.type === 'DEPOSIT' || tx.type === 'RECHARGE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                            tx.type === 'WITHDRAWAL' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                                            'bg-blue-50 text-blue-700 border border-blue-200'
                                        }`}>
                                            {tx.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 max-w-xs truncate" title={tx.description || '-'}>
                                        {tx.description || '-'}
                                    </td>
                                    <td className={`px-6 py-4 text-right font-bold ${
                                        tx.type === 'DEPOSIT' || tx.type === 'RECHARGE' ? 'text-emerald-600' : 
                                        tx.type === 'WITHDRAWAL' ? 'text-rose-600' : 'text-gray-800'
                                    }`}>
                                        {tx.type === 'DEPOSIT' || tx.type === 'RECHARGE' ? '+' : tx.type === 'WITHDRAWAL' ? '-' : ''}
                                        {tx.amount.toFixed(2)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LedgerTable;
