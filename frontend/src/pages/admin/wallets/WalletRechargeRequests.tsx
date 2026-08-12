import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../store/store';
import { fetchRechargeRequests, approveRechargeRequest, rejectRechargeRequest } from '../../../features/admin/adminSlice';
import { CheckCircle, XCircle } from 'lucide-react';

const WalletRechargeRequests: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { rechargeRequests, loading } = useSelector((state: RootState) => state.admin);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    useEffect(() => {
        dispatch(fetchRechargeRequests());
    }, [dispatch]);

    const handleApprove = async (id: number) => {
        if (!window.confirm('Are you sure you want to approve this recharge request? Funds will be credited to the user\'s wallet immediately.')) return;
        
        setActionLoading(id);
        const remarks = prompt('Enter approval remarks (optional):') || 'Approved manually';
        await dispatch(approveRechargeRequest({ id, remarks }));
        setActionLoading(null);
    };

    const handleReject = async (id: number) => {
        if (!window.confirm('Are you sure you want to REJECT this recharge request?')) return;

        setActionLoading(id);
        const remarks = prompt('Enter rejection reason (required):');
        if (!remarks) {
            alert('Rejection reason is required.');
            setActionLoading(null);
            return;
        }
        await dispatch(rejectRechargeRequest({ id, remarks }));
        setActionLoading(null);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 flex items-center">
                        <span className="w-8 h-8 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">📥</span>
                        Manual Fund Requests
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Approve or reject offline NEFT/RTGS top-up requests from partners</p>
                </div>
            </div>

            <div className="bg-white border border-gray-100 shadow-sm rounded-lg overflow-hidden mt-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-medium">Date</th>
                                <th className="px-6 py-4 font-medium">Partner</th>
                                <th className="px-6 py-4 font-medium">Mode & UTR</th>
                                <th className="px-6 py-4 font-medium">Amount (₹)</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && rechargeRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : rechargeRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        No fund requests found.
                                    </td>
                                </tr>
                            ) : (
                                rechargeRequests.map((req) => (
                                    <tr key={req.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-800">
                                            {new Date(req.createdAt).toLocaleDateString()} <span className="text-xs text-gray-400 ml-1">{new Date(req.createdAt).toLocaleTimeString()}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{req.userName}</div>
                                            <div className="text-xs text-gray-500">{req.userEmail}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-700">{req.transferMode}</div>
                                            <div className="text-xs font-mono text-indigo-600">UTR: {req.referenceNumber}</div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900">
                                            ₹{req.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                                                req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                                req.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                                                'bg-amber-50 text-amber-700 border border-amber-200'
                                            }`}>
                                                {req.status}
                                            </span>
                                            {req.adminRemarks && (
                                                <div className="text-[10px] text-gray-400 mt-1 max-w-[150px] truncate" title={req.adminRemarks}>
                                                    "{req.adminRemarks}"
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {req.status === 'PENDING' ? (
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button 
                                                        onClick={() => handleReject(req.id)}
                                                        disabled={actionLoading === req.id}
                                                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-full transition-colors disabled:opacity-50"
                                                        title="Reject"
                                                    >
                                                        <XCircle className="w-5 h-5" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleApprove(req.id)}
                                                        disabled={actionLoading === req.id}
                                                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors disabled:opacity-50"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="text-gray-400 text-xs italic">Processed</div>
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

export default WalletRechargeRequests;
