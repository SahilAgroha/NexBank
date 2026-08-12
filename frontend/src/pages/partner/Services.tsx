import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store/store';
import { fetchActiveProducts, purchaseProduct } from '../../features/product/productSlice';
import { ShoppingBag, Star, Zap, CheckCircle } from 'lucide-react';

const Services: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { products, loading } = useSelector((state: RootState) => state.product);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        dispatch(fetchActiveProducts({ page: 0, size: 50 }));
    }, [dispatch]);

    const handlePurchase = () => {
        if (selectedProduct) {
            setErrorMessage('');
            dispatch(purchaseProduct({ productId: selectedProduct.id, quantity: 1 }))
                .unwrap()
                .then(() => {
                    setSuccessMessage(`Successfully purchased ${selectedProduct.name}! Check your invoices.`);
                    setSelectedProduct(null);
                    setTimeout(() => setSuccessMessage(''), 5000);
                })
                .catch((err) => {
                    setErrorMessage(typeof err === 'string' ? err : 'Failed to purchase service.');
                });
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-center py-8">
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Service Marketplace</h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">Enhance your fintech capabilities with our premium APIs and services. Instant activation upon purchase.</p>
            </div>

            {successMessage && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center justify-center space-x-3 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">{successMessage}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products?.content?.map((product) => (
                    <div key={product.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 group flex flex-col">
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <Zap className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">{product.name}</h3>
                        <p className="text-slate-500 text-sm mb-6 flex-grow">{product.description}</p>
                        
                        <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-100">
                            <div>
                                <span className="text-sm text-slate-400 font-medium">Price</span>
                                <div className="text-2xl font-black text-slate-900">₹{product.price.toLocaleString()}</div>
                            </div>
                            <button 
                                onClick={() => setSelectedProduct(product)}
                                className="px-5 py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-indigo-600 shadow-lg hover:shadow-indigo-500/30 transition-all"
                            >
                                Buy Now
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl scale-in-center">
                        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mx-auto mb-4">
                            <ShoppingBag className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-center text-slate-800 mb-2">Confirm Purchase</h3>
                        <p className="text-center text-slate-500 mb-6">You are about to purchase <strong>{selectedProduct.name}</strong>. The amount will be deducted from your wallet balance.</p>
                        
                        {errorMessage && (
                            <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-sm text-center mb-4">
                                {errorMessage}
                            </div>
                        )}

                        <div className="bg-slate-50 rounded-2xl p-4 mb-6">
                            <div className="flex justify-between mb-2 text-sm text-slate-600">
                                <span>Subtotal</span>
                                <span>₹{selectedProduct.price.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between mb-3 text-sm text-slate-600">
                                <span>GST (18%)</span>
                                <span>₹{(selectedProduct.price * 0.18).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between border-t border-slate-200 pt-3 font-bold text-slate-800">
                                <span>Total Amount</span>
                                <span className="text-indigo-600">₹{(selectedProduct.price * 1.18).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <button onClick={() => setSelectedProduct(null)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                            <button onClick={handlePurchase} className="flex-1 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-colors">Confirm & Pay</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Services;
