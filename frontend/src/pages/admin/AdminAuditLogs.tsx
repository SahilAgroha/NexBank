import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ShieldCheck, Search, Filter } from 'lucide-react';
import type { RootState, AppDispatch } from '../../store/store';
import { fetchAuditLogs } from '../../features/settings/settingsSlice';

const AdminAuditLogs = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { auditLogs, loading } = useSelector((state: RootState) => state.settings);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchAuditLogs());
  }, [dispatch]);

  const filteredLogs = auditLogs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.entityName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <ShieldCheck className="mr-3 h-6 w-6 text-indigo-600" />
          System Audit Logs
        </h1>
        <p className="text-sm text-gray-500 mt-1">Track and monitor all administrative actions across the platform</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs by admin, action, or entity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            />
          </div>
          <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 w-full sm:w-auto justify-center">
            <Filter className="w-4 h-4 mr-2" />
            Filter Logs
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">Loading audit logs...</td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{log.adminName}</div>
                      <div className="text-xs text-gray-500">ID: {log.adminId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.entityName} {log.entityId ? `(#${log.entityId})` : ''}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={log.details}>
                      {log.details}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                    No audit logs found matching your search.
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

export default AdminAuditLogs;
