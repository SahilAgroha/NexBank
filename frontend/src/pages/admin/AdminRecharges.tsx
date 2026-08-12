import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store/store';
import { fetchAdminRecharges, approveRecharge, rejectRecharge, clearActionError } from '../../features/admin/adminRechargeSlice';
import { CreditCard, CheckCircle, XCircle, Search, Clock } from 'lucide-react';

const AdminRecharges: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { requests, loading, actionError } = useSelector((state: RootState) => state.adminRecharge);
    const [statusFilter, setStatusFilter] = useState<string>('PENDING');
    
    // Popup state
    const [actionId, setActionId] = useState<number | null>(null);
    const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null);
    const [remarks, setRemarks] = useState('');
    const [isActionLoading, setIsActionLoading] = useState(false);
    const activePopoverRef = useRef<HTMLTableCellElement>(null);

    useEffect(() => {
        dispatch(fetchAdminRecharges({ page: 0, size: 50, status: statusFilter === 'ALL' ? undefined : statusFilter }));
    }, [dispatch, statusFilter]);

    // Click outside to cancel popup
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (actionId !== null && activePopoverRef.current && !activePopoverRef.current.contains(event.target as Node)) {
                setActionId(null);
                setRemarks('');
                dispatch(clearActionError());
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [actionId]);

    const handleAction = () => {
        if (actionId && actionType) {
            dispatch(clearActionError());
            setIsActionLoading(true);
            if (actionType === 'APPROVE') {
                dispatch(approveRecharge({ id: actionId, remarks }))
                    .unwrap()
                    .then(() => {
                        setActionId(null);
                        setRemarks('');
                    })
                    .catch(() => {}) // handled by slice
                    .finally(() => setIsActionLoading(false));
            } else {
                dispatch(rejectRecharge({ id: actionId, remarks }))
                    .unwrap()
                    .then(() => {
                        setActionId(null);
                        setRemarks('');
                    })
                    .catch(() => {})
                    .finally(() => setIsActionLoading(false));
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Recharge Requests</h2>
                    <p className="text-slate-500 mt-1">Review and process partner wallet funding requests.</p>
                </div>
                <div className="flex space-x-2 bg-slate-100 p-1 rounded-xl">
                    {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                statusFilter === status 
                                    ? 'bg-white text-indigo-600 shadow-sm' 
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            {status.charAt(0) + status.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {actionError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl flex items-start space-x-3 mb-6 animate-in fade-in zoom-in-95">
                    <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{actionError}</span>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Partner</th>
                                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Reference (UTR)</th>
                                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                            <p>Loading requests...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : requests?.content?.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                                                <CreditCard className="w-8 h-8 text-slate-400" />
                                            </div>
                                            <p className="text-lg font-medium text-slate-700">No requests found</p>
                                            <p className="text-sm">There are no {statusFilter.toLowerCase()} recharge requests.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                requests?.content?.map((request) => (
                                    <tr key={request.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="p-4 text-sm text-slate-600">
                                            <div className="flex items-center space-x-2">
                                                <Clock className="w-4 h-4 text-slate-400" />
                                                <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm font-medium text-slate-800">
                                            {request.partnerEmail}
                                        </td>
                                        <td className="p-4 text-sm font-bold text-slate-800">
                                            ₹{request.amount.toLocaleString()}
                                        </td>
                                        <td className="p-4 text-sm text-slate-600 font-mono bg-slate-50 rounded px-2">
                                            {request.referenceNumber}
                                        </td>
                                        <td className="p-4 text-sm">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                                request.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                request.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                'bg-rose-50 text-rose-700 border-rose-200'
                                            }`}>
                                                {request.status === 'PENDING' && <Clock className="w-3 h-3 mr-1" />}
                                                {request.status === 'APPROVED' && <CheckCircle className="w-3 h-3 mr-1" />}
                                                {request.status === 'REJECTED' && <XCircle className="w-3 h-3 mr-1" />}
                                                {request.status}
                                            </span>
                                            {request.adminRemarks && (
                                                <p className="text-xs text-slate-400 mt-1">"{request.adminRemarks}"</p>
                                            )}
                                        </td>
                                        <td className="p-4 text-sm text-right relative" ref={actionId === request.id ? activePopoverRef : null}>
                                            <div className="flex justify-end space-x-2">
                                                <button 
                                                    onClick={() => { setActionId(request.id); setActionType('APPROVE'); }}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1 ${
                                                        request.status === 'APPROVED' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                                                    }`}
                                                >
                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                    <span>{request.status === 'APPROVED' ? 'Approved' : 'Approve'}</span>
                                                </button>
                                                <button 
                                                    onClick={() => { setActionId(request.id); setActionType('REJECT'); }}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1 ${
                                                        request.status === 'REJECTED' ? 'bg-rose-600 text-white shadow-sm' : 'text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200'
                                                    }`}
                                                >
                                                    <XCircle className="w-3.5 h-3.5" />
                                                    <span>{request.status === 'REJECTED' ? 'Rejected' : 'Reject'}</span>
                                                </button>
                                            </div>

                                            {/* Action Popover */}
                                            {actionId === request.id && (
                                                <div className="absolute bottom-[110%] right-0 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-2xl p-4 z-20 w-64 animate-in fade-in zoom-in-95 duration-200">
                                                    <div className="absolute -bottom-2 right-12 w-4 h-4 bg-slate-900/95 border-b border-r border-slate-700/50 transform rotate-45"></div>
                                                    
                                                    <div className="relative z-10 flex flex-col space-y-3 text-left">
                                                        <p className="text-sm font-semibold text-white">
                                                            {actionType === 'APPROVE' ? 'Approve Recharge?' : 'Reject Recharge?'}
                                                        </p>
                                                        
                                                        <input
                                                            type="text"
                                                            placeholder="Add optional remarks..."
                                                            value={remarks}
                                                            onChange={(e) => setRemarks(e.target.value)}
                                                            disabled={isActionLoading}
                                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                                                        />
                                                        
                                                        <div className="flex space-x-2 pt-1">
                                                            <button 
                                                                onClick={() => {
                                                                    setActionId(null);
                                                                    dispatch(clearActionError());
                                                                }}
                                                                disabled={isActionLoading}
                                                                className="flex-1 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button 
                                                                onClick={handleAction}
                                                                disabled={isActionLoading}
                                                                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium text-white shadow-lg transition-all flex items-center justify-center space-x-2 ${
                                                                    isActionLoading ? 'opacity-75 cursor-not-allowed' : 'hover:-translate-y-0.5'
                                                                } ${
                                                                    actionType === 'APPROVE' 
                                                                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-emerald-500/30' 
                                                                        : 'bg-gradient-to-r from-rose-500 to-rose-600 shadow-rose-500/30'
                                                                }`}
                                                            >
                                                                {isActionLoading && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                                                                <span>{isActionLoading ? 'Processing' : 'Confirm'}</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminRecharges;
