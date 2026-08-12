import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store/store';
import { fetchGlobalMargins, updateGlobalMargin } from '../../features/admin/customerManagementSlice';
import { fetchAdminProducts } from '../../features/product/productSlice';
import { Save, RefreshCw } from 'lucide-react';

const AdminMarginSettings = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { margins, loading } = useSelector((state: RootState) => state.customerManagement);
    const { products: paginatedProducts } = useSelector((state: RootState) => state.product);
    const products = paginatedProducts?.content || [];

    const [localMargins, setLocalMargins] = useState<Record<number, { type: string, amount: string }>>({});

    useEffect(() => {
        dispatch(fetchAdminProducts({ page: 0, size: 100 }));
        dispatch(fetchGlobalMargins());
    }, [dispatch]);

    useEffect(() => {
        const newLocal: Record<number, { type: string, amount: string }> = {};
        products.forEach(p => {
            const margin = margins.find(m => m.serviceProduct?.id === p.id);
            newLocal[p.id] = {
                type: margin ? margin.marginType : 'PERCENTAGE',
                amount: margin ? margin.amount.toString() : '0'
            };
        });
        setLocalMargins(newLocal);
    }, [margins, products]);

    const handleSave = (productId: number) => {
        const val = localMargins[productId];
        if (val) {
            dispatch(updateGlobalMargin({
                serviceProductId: productId,
                marginType: val.type,
                amount: parseFloat(val.amount) || 0
            }));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Global Margin Settings</h1>
                <button onClick={() => dispatch(fetchGlobalMargins())} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                    <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="p-4 text-sm font-semibold text-gray-600">Service Product</th>
                                <th className="p-4 text-sm font-semibold text-gray-600 w-48">Margin Type</th>
                                <th className="p-4 text-sm font-semibold text-gray-600 w-48">Amount</th>
                                <th className="p-4 text-sm font-semibold text-gray-600 w-24">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-medium text-gray-900">{product.name}</div>
                                        <div className="text-xs text-gray-500">ID: {product.id} • {product.category}</div>
                                    </td>
                                    <td className="p-4">
                                        <select 
                                            value={localMargins[product.id]?.type || 'PERCENTAGE'}
                                            onChange={(e) => setLocalMargins({...localMargins, [product.id]: {...localMargins[product.id], type: e.target.value}})}
                                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="PERCENTAGE">% Percentage</option>
                                            <option value="FLAT">Flat Rate</option>
                                            <option value="SURCHARGE">Surcharge</option>
                                        </select>
                                    </td>
                                    <td className="p-4">
                                        <div className="relative">
                                            {localMargins[product.id]?.type === 'PERCENTAGE' ? null : <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>}
                                            <input 
                                                type="number"
                                                value={localMargins[product.id]?.amount || ''}
                                                onChange={(e) => setLocalMargins({...localMargins, [product.id]: {...localMargins[product.id], amount: e.target.value}})}
                                                className={`w-full bg-white border border-gray-300 rounded-lg py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${localMargins[product.id]?.type === 'PERCENTAGE' ? 'px-3' : 'pl-7 pr-3'}`}
                                            />
                                            {localMargins[product.id]?.type === 'PERCENTAGE' && <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <button 
                                            onClick={() => handleSave(product.id)}
                                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                            title="Save Margin"
                                        >
                                            <Save className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {products.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-gray-500">No products available.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminMarginSettings;
