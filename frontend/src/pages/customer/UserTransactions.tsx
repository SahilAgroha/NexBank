import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../store/store';
import { fetchTransactions } from '../../features/wallet/walletSlice';
import { ArrowDownLeft, ArrowUpRight, Search, Download, Filter, Calendar, Activity } from 'lucide-react';

const UserTransactions = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { transactions, loading } = useSelector((state: RootState) => state.wallet);
  const { user } = useSelector((state: RootState) => state.auth);

  const [page, setPage] = useState(0);
  const [size] = useState(15); 
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [type, setType] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchTransactions());
  }, [dispatch]);

  // Client-side filtering
  const filteredTransactions = transactions.filter(trx => {
    let match = true;
    
    // Type filtering
    const isSender = trx.senderName === user?.fullName;
    const isDebit = (isSender && trx.type === 'TRANSFER') || trx.type === 'WITHDRAWAL';
    const computedType = isDebit ? 'DEBIT' : 'CREDIT';
    
    if (type && computedType !== type) {
      match = false;
    }
    
    // Date filtering
    const trxDate = new Date(trx.createdAt).getTime();
    if (startDate && trxDate < new Date(startDate).getTime()) match = false;
    if (endDate && trxDate > new Date(endDate).getTime()) match = false;
    
    return match;
  });

  const totalPages = Math.ceil(filteredTransactions.length / size);
  const paginatedTransactions = filteredTransactions.slice(page * size, (page + 1) * size);

  const handleExport = () => {
    // Generate CSV client-side since we have the data
    let csvContent = "data:text/csv;charset=utf-8,Date,Reference,Type,Amount,Status,Description\n";
    filteredTransactions.forEach(trx => {
      const isSender = trx.senderName === user?.fullName;
      const isDebit = (isSender && trx.type === 'TRANSFER') || trx.type === 'WITHDRAWAL';
      const computedType = isDebit ? 'DEBIT' : 'CREDIT';
      const date = new Date(trx.createdAt).toLocaleString();
      const row = `"${date}","${trx.referenceNumber}","${computedType}",${trx.amount},"${trx.status}","${trx.description || ''}"`;
      csvContent += row + "\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "my_transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Group entries by date
  const groupedEntries = paginatedTransactions.reduce((acc: any, trx: any) => {
    const date = new Date(trx.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(trx);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Activity Feed</h1>
          <p className="text-gray-500 mt-2 text-base">Track your spending and incoming funds.</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              showFilters ? 'bg-indigo-100 text-indigo-700' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-indigo-700 transition-all"
          >
            <Download className="w-4 h-4 mr-2" />
            Statement
          </button>
        </div>
      </div>

      {/* Modern Filter Panel */}
      {showFilters && (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-indigo-100 animate-in slide-in-from-top-4 duration-300 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">From Date</label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="datetime-local" 
                value={startDate} 
                onChange={(e) => { setPage(0); setStartDate(e.target.value); }}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-gray-800"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">To Date</label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="datetime-local" 
                value={endDate} 
                onChange={(e) => { setPage(0); setEndDate(e.target.value); }}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-gray-800"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Transaction Type</label>
            <select 
              value={type} 
              onChange={(e) => { setPage(0); setType(e.target.value); }}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-gray-800 appearance-none"
            >
              <option value="">All Transactions</option>
              <option value="CREDIT">Money In (Credits)</option>
              <option value="DEBIT">Money Out (Debits)</option>
            </select>
          </div>
          {(startDate || endDate || type) && (
            <div className="md:col-span-3 flex justify-end">
              <button 
                onClick={() => { setStartDate(''); setEndDate(''); setType(''); setPage(0); }}
                className="text-sm font-bold text-red-500 hover:text-red-700"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Activity Feed */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
        {loading && filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
            <p className="font-medium">Loading activity...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Activity className="h-12 w-12 text-gray-200 mb-4" />
            <p className="text-lg font-bold text-gray-900">No transactions found</p>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or making a transfer.</p>
          </div>
        ) : (
          <div>
            {Object.keys(groupedEntries).map((date) => (
              <div key={date}>
                <div className="bg-gray-50/80 px-6 py-2 border-y border-gray-100">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{date}</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {groupedEntries[date].map((trx: any, idx: number) => {
                    const isSender = trx.senderName === user?.fullName;
                    const isDebit = (isSender && trx.type === 'TRANSFER') || trx.type === 'WITHDRAWAL';
                    const amountStr = `₹${trx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
                    
                    return (
                      <div key={trx.referenceNumber || idx} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors group cursor-pointer">
                        <div className="flex items-center space-x-5">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${
                            isDebit ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            {isDebit ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="text-base font-bold text-gray-900">
                              {trx.type === 'TRANSFER' 
                                ? (isDebit ? `Sent to ${trx.receiverName}` : `Received from ${trx.senderName}`)
                                : trx.description || trx.type}
                            </p>
                            <div className="flex items-center mt-1 space-x-2">
                              <span className="text-xs font-medium text-gray-500">
                                {new Date(trx.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className="text-gray-300">•</span>
                              <span className="text-xs font-mono text-gray-400" title="Transaction ID">
                                {trx.referenceNumber}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-extrabold text-lg ${isDebit ? 'text-gray-900' : 'text-emerald-600'}`}>
                            {isDebit ? '-' : '+'}{amountStr}
                          </p>
                          <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${trx.status === 'SUCCESS' ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {trx.status}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Pagination Footer */}
        {filteredTransactions.length > 0 && (
          <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
            <span className="text-sm font-bold text-gray-500">
              Showing {paginatedTransactions.length} of {filteredTransactions.length} transactions
            </span>
            <div className="flex space-x-2">
              <button 
                disabled={page === 0 || loading} 
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 border border-gray-200 rounded-xl bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button 
                disabled={page >= totalPages - 1 || loading} 
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 border border-gray-200 rounded-xl bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
};

export default UserTransactions;
