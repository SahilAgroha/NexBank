import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store/store';
import { fetchMyLedger, downloadLedgerCsv } from '../../features/ledger/ledgerSlice';

const MyLedger: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { entries, loading, totalPages, totalElements } = useSelector((state: RootState) => state.ledger);

    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [type, setType] = useState('');

    useEffect(() => {
        loadLedger();
    }, [page, startDate, endDate, type]);

    const loadLedger = () => {
        dispatch(fetchMyLedger({
            page,
            size,
            startDate: startDate ? new Date(startDate).toISOString() : undefined,
            endDate: endDate ? new Date(endDate).toISOString() : undefined,
            type: type || undefined,
        }));
    };

    const handleExport = () => {
        downloadLedgerCsv(false, {
            startDate: startDate ? new Date(startDate).toISOString() : undefined,
            endDate: endDate ? new Date(endDate).toISOString() : undefined,
            type: type || undefined,
        });
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">My Ledger</h1>
                    <p className="text-gray-600 text-sm mt-1">Detailed history of all your balance changes.</p>
                </div>
                <button
                    onClick={handleExport}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Export CSV
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex space-x-4">
                <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                    <input 
                        type="datetime-local" 
                        value={startDate} 
                        onChange={(e) => { setPage(0); setStartDate(e.target.value); }}
                        className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">End Date</label>
                    <input 
                        type="datetime-local" 
                        value={endDate} 
                        onChange={(e) => { setPage(0); setEndDate(e.target.value); }}
                        className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Type</label>
                    <select 
                        value={type} 
                        onChange={(e) => { setPage(0); setType(e.target.value); }}
                        className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-200"
                    >
                        <option value="">All</option>
                        <option value="CREDIT">Credit</option>
                        <option value="DEBIT">Debit</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 text-sm border-b">
                        <tr>
                            <th className="p-4 font-medium">Date</th>
                            <th className="p-4 font-medium">Txn Ref</th>
                            <th className="p-4 font-medium">Type</th>
                            <th className="p-4 font-medium text-right">Amount (₹)</th>
                            <th className="p-4 font-medium text-right">Opening (₹)</th>
                            <th className="p-4 font-medium text-right">Closing (₹)</th>
                            <th className="p-4 font-medium">Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} className="p-4 text-center">Loading...</td></tr>
                        ) : entries.length === 0 ? (
                            <tr><td colSpan={7} className="p-4 text-center text-gray-500">No ledger entries found.</td></tr>
                        ) : (
                            entries.map(entry => (
                                <tr key={entry.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                                    <td className="p-4 text-sm whitespace-nowrap">{new Date(entry.createdAt).toLocaleString()}</td>
                                    <td className="p-4 text-sm font-mono">{entry.referenceNumber}</td>
                                    <td className="p-4 text-sm">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            entry.type === 'CREDIT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {entry.type}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-right font-medium">{entry.amount.toFixed(2)}</td>
                                    <td className="p-4 text-sm text-right text-gray-500">{entry.openingBalance.toFixed(2)}</td>
                                    <td className="p-4 text-sm text-right text-gray-500">{entry.closingBalance.toFixed(2)}</td>
                                    <td className="p-4 text-sm text-gray-600 truncate max-w-xs" title={entry.description}>{entry.description}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                <div className="p-4 border-t flex justify-between items-center bg-gray-50 text-sm">
                    <span className="text-gray-600">Total Entries: {totalElements}</span>
                    <div className="flex space-x-2">
                        <button 
                            disabled={page === 0} 
                            onClick={() => setPage(page - 1)}
                            className="px-3 py-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button 
                            disabled={page >= totalPages - 1} 
                            onClick={() => setPage(page + 1)}
                            className="px-3 py-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyLedger;
