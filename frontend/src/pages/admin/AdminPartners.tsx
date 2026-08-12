import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store/store';
import { fetchAdminPartners, toggleUserStatus, createAdminPartner } from '../../features/admin/adminSlice';
import { Plus, X, Eye } from 'lucide-react';

const AdminPartners: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { partners, loading } = useSelector((state: RootState) => state.admin);
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [confirmId, setConfirmId] = useState<number | null>(null);
    const activePopoverRef = useRef<HTMLTableCellElement>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        partnerType: 'DISTRIBUTOR'
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        dispatch(fetchAdminPartners({ page, size }));
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
        dispatch(toggleUserStatus({ id, active: !currentStatus, type: 'PARTNER' }));
        setConfirmId(null);
    };

    const handleCreatePartner = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await dispatch(createAdminPartner(formData)).unwrap();
            setShowCreateModal(false);
            setFormData({ fullName: '', email: '', phone: '', password: '', partnerType: 'DISTRIBUTOR' });
            alert("Partner created successfully!");
        } catch (err: any) {
            alert(err || "Failed to create partner");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Partner Management</h1>
                <button 
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Partner
                </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 text-sm border-b">
                        <tr>
                            <th className="p-4 font-medium">Name</th>
                            <th className="p-4 font-medium">Email</th>
                            <th className="p-4 font-medium">Type</th>
                            <th className="p-4 font-medium">KYC</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="p-4 text-center">Loading...</td></tr>
                        ) : partners.content.length === 0 ? (
                            <tr><td colSpan={6} className="p-4 text-center text-gray-500">No partners found.</td></tr>
                        ) : (
                            partners.content.map(partner => (
                                <tr key={partner.id} className="border-b last:border-0 hover:bg-gray-50">
                                    <td className="p-4 text-sm font-medium">{partner.fullName}</td>
                                    <td className="p-4 text-sm text-gray-600">{partner.email}</td>
                                    <td className="p-4 text-sm text-gray-600 font-mono text-xs">{partner.partnerType}</td>
                                    <td className="p-4 text-sm">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            partner.kycStatus === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                            partner.kycStatus === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {partner.kycStatus}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            partner.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {partner.isActive ? 'Active' : 'Disabled'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-right relative" ref={confirmId === partner.id ? activePopoverRef : null}>
                                        {confirmId === partner.id && (
                                            <div className="absolute bottom-[130%] right-0 bg-slate-900/95 backdrop-blur-md border border-slate-700/50 shadow-[0_10px_40px_rgba(0,0,0,0.4)] rounded-full p-1.5 z-10 flex items-center space-x-1 whitespace-nowrap animate-in fade-in zoom-in duration-200">
                                                <div className="absolute -bottom-1.5 right-6 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-900/95 drop-shadow-[0px_2px_2px_rgba(0,0,0,0.2)]"></div>
                                                <span className="text-slate-200 text-xs font-medium pl-3 pr-2">Confirm {partner.isActive ? 'disable' : 'enable'}?</span>
                                                <div className="flex space-x-1">
                                                    <button 
                                                        onClick={() => setConfirmId(null)}
                                                        className="px-3 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-full text-xs font-medium transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button 
                                                        onClick={() => confirmToggleStatus(partner.id, partner.isActive)}
                                                        className={`px-4 py-1.5 text-white rounded-full text-xs font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 ${
                                                            partner.isActive ? 'bg-gradient-to-r from-rose-500 to-red-600 shadow-red-500/40 hover:shadow-red-500/60' : 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-blue-500/40 hover:shadow-blue-500/60'
                                                        }`}
                                                    >
                                                        {partner.isActive ? 'Disable' : 'Enable'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        <button 
                                            onClick={() => setConfirmId(partner.id)}
                                            className={`px-3 py-1.5 rounded-md text-xs font-medium text-white transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 ${
                                                partner.isActive ? 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/30' : 'bg-red-500 hover:bg-red-600 shadow-red-500/30'
                                            }`}
                                        >
                                            {partner.isActive ? 'Enable' : 'Disable'}
                                        </button>
                                        <button 
                                            onClick={() => navigate(`/admin/user/${partner.id}`)}
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
                    <span className="text-gray-600">Total: {partners.totalElements}</span>
                    <div className="flex space-x-2">
                        <button disabled={page === 0} onClick={() => setPage(page - 1)} className="px-3 py-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50">Previous</button>
                        <button disabled={page >= partners.totalPages - 1} onClick={() => setPage(page + 1)} className="px-3 py-1 border rounded bg-white hover:bg-gray-100 disabled:opacity-50">Next</button>
                    </div>
                </div>
            </div>

            {/* Create Partner Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-lg font-semibold text-gray-900">Create New Partner</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreatePartner} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input 
                                    type="text" required 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={formData.fullName} 
                                    onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input 
                                    type="email" required 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={formData.email} 
                                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input 
                                    type="tel" required 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={formData.phone} 
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input 
                                    type="password" required minLength={6}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={formData.password} 
                                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Partner Type</label>
                                <select 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={formData.partnerType}
                                    onChange={(e) => setFormData({...formData, partnerType: e.target.value})}
                                >
                                    <option value="DISTRIBUTOR">Distributor</option>
                                    <option value="RETAILER">Retailer</option>
                                    <option value="API_PARTNER">API Partner</option>
                                </select>
                            </div>
                            <div className="pt-4 flex space-x-3">
                                <button 
                                    type="button" 
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={submitting}
                                    className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    {submitting ? 'Creating...' : 'Create Partner'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPartners;
