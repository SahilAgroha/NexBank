import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Network, Plus, ChevronRight, ChevronDown, UserCheck, UserX, X, User, AlertCircle } from 'lucide-react';
import type { AppDispatch, RootState } from '../../../store/store';
import { fetchHierarchyTree, createAdminPartner } from '../../../features/admin/adminSlice';
import type { HierarchyNodeDto } from '../../../features/admin/adminSlice';

// Recursive Tree Node Component
const TreeNode: React.FC<{ node: HierarchyNodeDto; level: number }> = ({ node, level }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const getIconColor = (type?: string) => {
        switch (type) {
            case 'SUPER_HEAD': return 'text-purple-600 bg-purple-100';
            case 'MASTER_DEALER': return 'text-blue-600 bg-blue-100';
            case 'DISTRIBUTOR': return 'text-green-600 bg-green-100';
            case 'RETAILER': return 'text-orange-600 bg-orange-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <div className="w-full">
            <div 
                className={`flex items-center py-3 px-4 hover:bg-gray-50 transition-colors border-l-2 ${node.isActive ? 'border-transparent' : 'border-red-400 bg-red-50/20'}`}
                style={{ paddingLeft: `${level * 2 + 1}rem` }}
            >
                {/* Expander Icon */}
                <button 
                    onClick={toggleExpand} 
                    className={`p-1 mr-2 rounded-md hover:bg-gray-200 transition-colors ${node.children.length === 0 ? 'invisible' : ''}`}
                >
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                </button>

                {/* Node Icon */}
                <div className={`p-2 rounded-full mr-4 ${getIconColor(node.partnerType)}`}>
                    <User className="w-5 h-5" />
                </div>

                {/* Node Details */}
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">{node.fullName}</h4>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                            {node.partnerType || 'PARTNER'}
                        </span>
                        {!node.isActive && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center">
                                <UserX className="w-3 h-3 mr-1" /> Inactive
                            </span>
                        )}
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5 flex gap-4">
                        <span>{node.email}</span>
                        <span>•</span>
                        <span>{node.phone}</span>
                        {node.partnerCode && (
                            <>
                                <span>•</span>
                                <span className="font-mono text-xs">{node.partnerCode}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Children */}
            {isExpanded && node.children.length > 0 && (
                <div className="border-l border-gray-200 ml-6 relative">
                    {node.children.map(child => (
                        <TreeNode key={child.id} node={child} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

const AdminHierarchy = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { hierarchyTree, loading, error } = useSelector((state: RootState) => state.admin);
    
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        partnerType: 'DISTRIBUTOR'
    });

    useEffect(() => {
        dispatch(fetchHierarchyTree());
    }, [dispatch]);

    const handleCreatePartner = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await dispatch(createAdminPartner(formData)).unwrap();
            setShowCreateModal(false);
            setFormData({ fullName: '', email: '', phone: '', password: '', partnerType: 'DISTRIBUTOR' });
            // Refetch tree after creation
            dispatch(fetchHierarchyTree());
        } catch (err: any) {
            alert(err || "Failed to create partner");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Network className="mr-3 h-6 w-6 text-blue-600" />
                        Hierarchy Directory
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Visualize your complete partner network structure</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:ring-4 focus:ring-blue-100 font-medium"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Top-Level Partner
                </button>
            </div>

            {/* Tree View */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
                {loading && hierarchyTree.length === 0 ? (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                        Loading hierarchy...
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-64 text-red-500">
                        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                        <p className="font-medium">Failed to load hierarchy</p>
                        <p className="text-sm mt-1">{error}</p>
                    </div>
                ) : hierarchyTree.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        <Network className="w-12 h-12 text-gray-300 mb-4" />
                        <p>No partners found in the network.</p>
                    </div>
                ) : (
                    <div className="py-2">
                        {hierarchyTree.map(node => (
                            <TreeNode key={node.id} node={node} level={0} />
                        ))}
                    </div>
                )}
            </div>

            {/* Create Partner Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">Add New Partner</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreatePartner} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                    placeholder="Enter full name"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        placeholder="Email address"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                                    <input
                                        type="tel"
                                        required
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        placeholder="Phone number"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        placeholder="Set password"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Partner Type</label>
                                    <select
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                        value={formData.partnerType}
                                        onChange={(e) => setFormData({...formData, partnerType: e.target.value})}
                                    >
                                        <option value="SUPER_HEAD">Super Head</option>
                                        <option value="MASTER_DEALER">Master Dealer</option>
                                        <option value="DISTRIBUTOR">Distributor</option>
                                        <option value="RETAILER">Retailer</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-all"
                                >
                                    {submitting ? 'Creating...' : 'Create Partner Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminHierarchy;
