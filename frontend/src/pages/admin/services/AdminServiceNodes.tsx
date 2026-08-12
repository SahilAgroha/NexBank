import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Server, Plus, ToggleLeft, ToggleRight, X } from 'lucide-react';
import type { AppDispatch, RootState } from '../../../store/store';
import { fetchServiceNodes, fetchServices, createServiceNode, toggleServiceNodeStatus } from '../../../features/services/serviceSlice';

const AdminServiceNodes = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { serviceNodes, services, loading } = useSelector((state: RootState) => state.services);
    
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        platformServiceId: 0,
        name: '',
        operatorCode: ''
    });

    useEffect(() => {
        dispatch(fetchServices());
        dispatch(fetchServiceNodes());
    }, [dispatch]);

    // Set default service ID when modal opens if services exist
    useEffect(() => {
        if (showCreateModal && services.length > 0 && formData.platformServiceId === 0) {
            setFormData(prev => ({ ...prev, platformServiceId: services[0].id }));
        }
    }, [showCreateModal, services]);

    const handleCreateNode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.platformServiceId === 0) {
            alert("Please select a parent service.");
            return;
        }
        setSubmitting(true);
        try {
            await dispatch(createServiceNode(formData)).unwrap();
            setShowCreateModal(false);
            setFormData({ platformServiceId: services[0]?.id || 0, name: '', operatorCode: '' });
        } catch (err: any) {
            alert(err || "Failed to create service node");
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggle = (id: number, active: boolean) => {
        dispatch(toggleServiceNodeStatus({ id, active: !active }));
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Server className="mr-3 h-6 w-6 text-purple-600" />
                        Service Nodes
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Manage individual operators and providers for your services</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Node
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Provider / Node</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Parent Service</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Operator Code</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading && serviceNodes.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">Loading service nodes...</td>
                                </tr>
                            ) : serviceNodes.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No service nodes found.</td>
                                </tr>
                            ) : (
                                serviceNodes.map((node) => (
                                    <tr key={node.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{node.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                                                {node.platformServiceName}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-mono text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                                {node.operatorCode}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${node.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {node.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button 
                                                onClick={() => handleToggle(node.id, node.isActive)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${node.isActive ? 'text-red-700 hover:bg-red-50' : 'text-green-700 hover:bg-green-50'}`}
                                            >
                                                {node.isActive ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                                                {node.isActive ? 'Disable' : 'Enable'}
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
                            <h2 className="text-xl font-bold text-gray-900">Add Service Node</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreateNode} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Parent Service</label>
                                {services.length === 0 ? (
                                    <div className="text-sm text-red-600 p-3 bg-red-50 rounded-lg border border-red-100">
                                        Please create a Platform Service first.
                                    </div>
                                ) : (
                                    <select
                                        required
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none"
                                        value={formData.platformServiceId}
                                        onChange={(e) => setFormData({...formData, platformServiceId: Number(e.target.value)})}
                                    >
                                        {services.map(s => (
                                            <option key={s.id} value={s.id}>{s.name} ({s.type})</option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Node Name (Operator)</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="e.g., Airtel Prepaid"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Unique Operator Code</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none font-mono"
                                    value={formData.operatorCode}
                                    onChange={(e) => setFormData({...formData, operatorCode: e.target.value.toUpperCase()})}
                                    placeholder="e.g., AT, JIO, VODA"
                                />
                                <p className="text-xs text-gray-500 mt-1">Used internally for API routing to gateways.</p>
                            </div>
                            
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={submitting || services.length === 0}
                                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-70 transition-all"
                                >
                                    {submitting ? 'Creating...' : 'Create Node'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminServiceNodes;
