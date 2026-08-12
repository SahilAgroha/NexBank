import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminTransactions } from '../../features/admin/adminSlice';
import type { AppDispatch, RootState } from '../../store/store';
import { Search, Download, RefreshCw, Eye } from 'lucide-react';

interface TransactionTableProps {
  title: string;
  subtitle: string;
  defaultStatus?: string;
  defaultType?: string;
  showStatusFilter?: boolean;
  showTypeFilter?: boolean;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  title,
  subtitle,
  defaultStatus = '',
  defaultType = '',
  showStatusFilter = true,
  showTypeFilter = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { transactions, loading } = useSelector(
    (state: RootState) => state.admin
  );

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(defaultStatus);
  const [type, setType] = useState(defaultType);
  const [page, setPage] = useState(0);

  const handleFetch = () => {
    dispatch(
      fetchAdminTransactions({
        page,
        size: 10,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        status: status || undefined,
        type: type || undefined,
        search: search || undefined,
      })
    );
  };

  useEffect(() => {
    handleFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, type]);

  const getStatusColor = (st: string) => {
    switch (st) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-800 border-green-200';

      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';

      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-200';

      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center">
            <span className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
              📄
            </span>
            {title}
          </h1>

          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>

        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 transition-colors">
          <Download className="w-4 h-4" />
          <span>Export Data</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Search Agent / Reference
            </label>

            <div className="relative">
              <input
                type="text"
                placeholder="Search Agent..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-300 rounded pl-3 pr-10 py-2 text-sm focus:outline-none focus:border-blue-500"
              />

              <Search className="absolute right-3 top-2.5 text-gray-400 w-4 h-4" />
            </div>
          </div>

          {/* From Date */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              From Date
            </label>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              To Date
            </label>

            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Query Button */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setPage(0);
                handleFetch();
              }}
              className="w-full bg-[#1e293b] text-white px-4 py-2 rounded text-sm hover:bg-[#334155] transition-colors flex items-center justify-center font-medium"
            >
              <Search className="w-4 h-4 mr-2" />
              Query
            </button>
          </div>
        </div>

        {/* Select Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Service Type */}
          {showTypeFilter && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Service
              </label>

              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setPage(0);
                }}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">All Services</option>
                <option value="SERVICE_PAYMENT">Service Payment</option>
                <option value="RECHARGE">Recharge</option>
                <option value="WITHDRAWAL">Withdrawal</option>
                <option value="DEPOSIT">Deposit</option>
              </select>
            </div>
          )}

          {/* Status */}
          {showStatusFilter && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Execution Status
              </label>

              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(0);
                }}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="SUCCESS">Success</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">
                  Date & Time
                </th>

                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">
                  Transaction ID
                </th>

                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">
                  Customer Profile
                </th>

                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">
                  Product / Account
                </th>

                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">
                  Amount (₹)
                </th>

                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase">
                  Status
                </th>

                <th className="px-6 py-4 font-semibold text-xs tracking-wider uppercase text-center">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading && transactions?.content?.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Loading transactions...
                  </td>
                </tr>
              ) : transactions?.content?.length > 0 ? (
                transactions.content.map((tx: any) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-gray-900 font-medium">
                      {tx.referenceNumber}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-gray-900 font-medium">
                          {tx.senderEmail || 'N/A'}
                        </span>

                        <span className="text-xs text-gray-500">
                          Wallet ID: {tx.senderWalletId || 'N/A'}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-gray-900 font-medium">
                          {tx.type}
                        </span>

                        <span className="text-xs text-gray-500">
                          {tx.description?.substring(0, 30) || '-'}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-semibold text-gray-900">
                      ₹{Number(tx.amount || 0).toFixed(2)}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                          tx.status
                        )}`}
                      >
                        {tx.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <button className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2 rounded-full transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-16 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-4xl mb-3">🧾</span>

                      <p className="font-medium text-gray-600">
                        No transactions found for the selected filters.
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        Try adjusting your search criteria
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {transactions?.totalPages > 1 && (
          <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Showing page {page + 1} of {transactions.totalPages}
            </span>

            <div className="flex space-x-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 text-sm border border-gray-200 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>

              <button
                disabled={page >= transactions.totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 text-sm border border-gray-200 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50"
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

export default TransactionTable;