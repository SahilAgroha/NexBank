import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store/store';
import { fetchAdminProducts, createProduct, updateProduct, deleteProduct, toggleProductActivation } from '../../features/product/productSlice';
import { Package, Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';

const AdminProducts: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { products, loading } = useSelector((state: RootState) => state.product);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [formData, setFormData] = useState({ name: '', description: '', price: '' });

    useEffect(() => {
        dispatch(fetchAdminProducts({ page: 0, size: 50 }));
    }, [dispatch]);

    const handleOpenModal = (product?: any) => {
        if (product) {
            setEditingProduct(product);
            setFormData({ name: product.name, description: product.description, price: product.price.toString() });
        } else {
            setEditingProduct(null);
            setFormData({ name: '', description: '', price: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingProduct) {
            dispatch(updateProduct({ id: editingProduct.id, ...formData, price: parseFloat(formData.price), isActive: editingProduct.isActive }));
        } else {
            dispatch(createProduct({ ...formData, price: parseFloat(formData.price), isActive: true }));
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Products & Services</h2>
                    <p className="text-slate-500 mt-1">Manage the services available for purchase.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Service</span>
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Service Name</th>
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Description</th>
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Price</th>
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {products?.content?.map((product) => (
                            <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 font-medium text-slate-800">{product.name}</td>
                                <td className="p-4 text-sm text-slate-500">{product.description}</td>
                                <td className="p-4 font-bold text-slate-800">₹{product.price.toLocaleString()}</td>
                                <td className="p-4">
                                    <button
                                        onClick={() => dispatch(toggleProductActivation(product.id))}
                                        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
                                            product.isActive ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        {product.isActive ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                        <span>{product.isActive ? 'Active' : 'Inactive'}</span>
                                    </button>
                                </td>
                                <td className="p-4 text-right">
                                    <button onClick={() => handleOpenModal(product)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => dispatch(deleteProduct(product.id))} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg ml-2">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-slate-800 mb-6">{editingProduct ? 'Edit Service' : 'Add New Service'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Service Name</label>
                                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
                                <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                            </div>
                            <div className="flex space-x-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/30">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;
