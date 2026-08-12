import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store/store';
import { fetchAdminUsers, toggleUserStatus } from '../../features/admin/adminSlice';
import { Eye } from 'lucide-react';

const AdminUsers: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { users, loading } = useSelector((state: RootState) => state.admin);
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [confirmId, setConfirmId] = useState<number | null>(null);
    const activePopoverRef = useRef<HTMLTableCellElement>(null);

    useEffect(() => {
        dispatch(fetchAdminUsers({ page, size }));
    }, [dispatch, page, size]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (confirmId !== null && activePopoverRef.current && !activePopoverRef.current.contains(event.target as Node)) {
                setConfirmId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [confirmId]);

    const confirmToggleStatus = (id: number, currentStatus: boolean) => {
        dispatch(toggleUserStatus({ id, active: !currentStatus, type: 'USER' }));
        setConfirmId(null);
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Customer Management</h1>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 text-sm border-b">
                        <tr>
                            <th className="p-4 font-medium">Name</th>
                            <th className="p-4 font-medium">Email</th>
                            <th className="p-4 font-medium">Phone</th>
                            <th className="p-4 font-medium">KYC</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="p-4 text-center">Loading...</td></tr>
                        ) : users.content.length === 0 ? (
                            <tr><td colSpan={6} className="p-4 text-center text-gray-500">No customers found.</td></tr>
                        ) : (
                            users.content.map(user => (
                                <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
                                    <td className="p-4 text-sm font-medium">{user.fullName}</td>
                                    <td className="p-4 text-sm text-gray-600">{user.email}</td>
                                    <td className="p-4 text-sm text-gray-600">{user.phone}</td>
                                    <td className="p-4 text-sm">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            user.kycStatus === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                            user.kycStatus === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {user.kycStatus}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {user.isActive ? 'Active' : 'Disabled'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-right relative" ref={confirmId === user.id ? activePopoverRef : null}>
                                        {confirmId === user.id && (
                                            <div className="absolute bottom-[130%] right-0 bg-slate-900/95 backdrop-blur-md border border-slate-700/50 shadow-[0_10px_40px_rgba(0,0,0,0.4)] rounded-full p-1.5 z-10 flex items-center space-x-1 whitespace-nowrap animate-in fade-in zoom-in duration-200">
                                                <div className="absolute -bottom-1.5 right-6 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-900/95 drop-shadow-[0px_2px_2px_rgba(0,0,0,0.2)]"></div>
                                                <span className="text-slate-200 text-xs font-medium pl-3 pr-2">Confirm {user.isActive ? 'disable' : 'enable'}?</span>
                                                <div className="flex space-x-1">
                                                    <button 
                                                        onClick={() => setConfirmId(null)}
                                                        className="px-3 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-full text-xs font-medium transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button 
                                                        onClick={() => confirmToggleStatus(user.id, user.isActive)}
                                                        className={`px-4 py-1.5 text-white rounded-full text-xs font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 ${
                                                            user.isActive ? 'bg-gradient-to-r from-rose-500 to-red-600 shadow-red-500/40 hover:shadow-red-500/60' : 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-blue-500/40 hover:shadow-blue-500/60'
                                                        }`}
                                                    >
                                                        {user.isActive ? 'Disable' : 'Enable'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        <button 
                                            onClick={() => setConfirmId(user.id)}
                                            className={`px-3 py-1.5 rounded-md text-xs font-medium text-white transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 ${
                                                user.isActive ? 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/30' : 'bg-red-500 hover:bg-red-600 shadow-red-500/30'
                                            }`}
                                        >
                                            {user.isActive ? 'Enable' : 'Disable'}
                                        </button>
                                        <button 
                                            onClick={() => navigate(`/admin/user/${user.id}`)}
                                            className="ml-2 px-3 py-1.5 rounded-md text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors shadow-sm"
                                        >
                                            <div className="flex items-center space-x-1">
                                                <Eye className="w-3 h-3" />
                                                <span>View</span>
                                            </div>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                <div className="p-4 border-t flex justify-between items-center bg-gray-50 text-sm">
                    <span className="text-gray-600">Total: {users.totalElements}</span>
                    <div className="flex space-x-2">
                        <button disabled={page === 0} onClick={() => setPage(page - 1)} className="px-3 py-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50">Previous</button>
                        <button disabled={page >= users.totalPages - 1} onClick={() => setPage(page + 1)} className="px-3 py-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;
