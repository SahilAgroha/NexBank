import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Settings, Plus, ToggleLeft, ToggleRight, X, LayoutGrid } from 'lucide-react';
import type { AppDispatch, RootState } from '../../../store/store';
import { fetchServices, createService, toggleServiceStatus } from '../../../features/services/serviceSlice';

const AdminServices = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { services, loading } = useSelector((state: RootState) => state.services);
    
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'RECHARGE',
        icon: 'smartphone'
    });

    useEffect(() => {
        dispatch(fetchServices());
    }, [dispatch]);

    const handleCreateService = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await dispatch(createService(formData)).unwrap();
            setShowCreateModal(false);
            setFormData({ name: '', type: 'RECHARGE', icon: 'smartphone' });
        } catch (err: any) {
            alert(err || "Failed to create service");
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggle = (id: number, active: boolean) => {
        dispatch(toggleServiceStatus({ id, active: !active }));
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <LayoutGrid className="mr-3 h-6 w-6 text-blue-600" />
                        Platform Services
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Manage core platform offerings and categories</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Service
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Service Name</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Icon</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading && services.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Loading services...</td>
                                </tr>
                            ) : services.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No platform services found.</td>
                                </tr>
                            ) : (
                                services.map((service) => (
                                    <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{service.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700">
                                                {service.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {service.icon}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${service.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {service.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(service.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button 
                                                onClick={() => handleToggle(service.id, service.isActive)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${service.isActive ? 'text-red-700 hover:bg-red-50' : 'text-green-700 hover:bg-green-50'}`}
                                            >
                                                {service.isActive ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                                                {service.isActive ? 'Disable' : 'Enable'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">Add New Service</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreateService} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Service Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="e.g., Mobile Recharge"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Service Type</label>
                                <select
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                    value={formData.type}
                                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                                >
                                    <option value="RECHARGE">Recharge</option>
                                    <option value="UTILITY">Utility / Bill Payment</option>
                                    <option value="TRANSFER">Money Transfer</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Icon Identifier (lucide-react name)</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                    value={formData.icon}
                                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                                    placeholder="e.g., smartphone"
                                />
                            </div>
                            
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-all"
                                >
                                    {submitting ? 'Creating...' : 'Create Service'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminServices;
