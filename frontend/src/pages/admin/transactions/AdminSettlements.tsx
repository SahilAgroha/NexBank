import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminTransactions, approveTransaction } from '../../../features/admin/adminSlice';
import type { AppDispatch, RootState } from '../../../store/store';
import { CheckCircle, Clock, RefreshCw, Check } from 'lucide-react';

const AdminSettlements = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { transactions, loading } = useSelector((state: RootState) => state.admin);
  const [search, setSearch] = useState('');

  const handleFetch = () => {
    dispatch(fetchAdminTransactions({
      page: 0,
      size: 100, // Fetch more for settlements
      status: 'PENDING',
      type: 'WITHDRAWAL',
      search: search || undefined
    }));
  };

  useEffect(() => {
    handleFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApprove = (id: number) => {
    if (window.confirm('Are you sure you want to approve this settlement?')) {
      dispatch(approveTransaction(id));
    }
  };

  const handleApproveAll = () => {
    if (window.confirm('Are you sure you want to approve ALL ready settlements?')) {
        const readyIds = transactions?.content?.filter((tx: any) => tx.status === 'PENDING').map((tx: any) => tx.id) || [];
        readyIds.forEach((id: number) => dispatch(approveTransaction(id)));
    }
  };

  // Metrics
  const txList = transactions?.content || [];
  const totalHeldCount = txList.length;
  const totalHeldAmount = txList.reduce((sum: number, tx: any) => sum + tx.amount, 0);
  
  // We consider all fetched transactions as 'ready' for this MVP
  const readyCount = totalHeldCount;
  const readyAmount = totalHeldAmount;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center">
            <span className="w-8 h-8 rounded bg-teal-100 text-teal-600 flex items-center justify-center mr-3 text-lg">⏳</span>
            T+1 Payment Settlement
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage held payments and approve customer credits</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={handleApproveAll}
            className="flex items-center space-x-2 px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded text-sm hover:bg-green-100 transition-colors font-medium"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Approve All Ready</span>
          </button>
          <button 
            onClick={handleFetch}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded text-sm hover:bg-blue-100 transition-colors font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded border border-gray-100 shadow-sm flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-gray-800">{totalHeldCount}</span>
          <span className="text-xs text-gray-500 uppercase mt-2 font-medium">Total Held</span>
        </div>
        <div className="bg-white p-5 rounded border border-gray-100 shadow-sm flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-green-600">{readyCount}</span>
          <span className="text-xs text-gray-500 uppercase mt-2 font-medium">Ready for Approval</span>
        </div>
        <div className="bg-white p-5 rounded border border-gray-100 shadow-sm flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-blue-600">₹{totalHeldAmount.toFixed(2)}</span>
          <span className="text-xs text-gray-500 uppercase mt-2 font-medium">Total Amount Held</span>
        </div>
        <div className="bg-white p-5 rounded border border-gray-100 shadow-sm flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-green-600">₹{readyAmount.toFixed(2)}</span>
          <span className="text-xs text-gray-500 uppercase mt-2 font-medium">Ready Amount</span>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4">
        <div className="flex-1 w-full">
          <label className="block text-xs font-medium text-gray-500 mb-1">Customer / Reference ID</label>
          <input 
            type="text"
            placeholder="Optional search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex space-x-3 w-full md:w-auto pt-5">
          <button 
            onClick={handleFetch}
            className="flex-1 md:flex-none px-6 py-2 bg-[#1e293b] text-white rounded text-sm font-medium hover:bg-[#334155] transition-colors"
          >
            Search
          </button>
          <button 
            onClick={() => { setSearch(''); handleFetch(); }}
            className="flex-1 md:flex-none px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Clear Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Transaction ID</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Customer Name</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Amount</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Created</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">Status</th>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Loading held payments...
                  </td>
                </tr>
              ) : txList.length > 0 ? (
                txList.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-900 font-medium">
                      {tx.referenceNumber}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900 font-medium">{tx.senderEmail || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-blue-600">
                      ₹{tx.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center text-yellow-600 text-xs font-medium">
                        <Clock className="w-4 h-4 mr-1" />
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       {tx.status === 'PENDING' ? (
                          <button 
                            onClick={() => handleApprove(tx.id)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center justify-center mx-auto"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Approve
                          </button>
                       ) : (
                          <span className="text-green-600 text-xs font-bold">SETTLED</span>
                       )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-4xl mb-3">✅</span>
                      <p className="font-medium text-gray-600">All caught up! No held payments pending settlement.</p>
                    </div>
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

export default AdminSettlements;
