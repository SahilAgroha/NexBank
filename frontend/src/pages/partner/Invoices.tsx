import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store/store';
import { fetchMyInvoices, emailInvoice } from '../../features/invoice/invoiceSlice';
import { FileText, Download, Mail, CheckCircle } from 'lucide-react';
import api from '../../api/api';

const Invoices: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { invoices, loading } = useSelector((state: RootState) => state.invoice);

    useEffect(() => {
        dispatch(fetchMyInvoices({ page: 0, size: 50 }));
    }, [dispatch]);

    const handleDownload = async (id: number) => {
        try {
            const response = await api.get(`/invoices/${id}/download`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Failed to download PDF', error);
        }
    };

    const handleEmail = (id: number) => {
        dispatch(emailInvoice(id));
        alert('Invoice sent to your email successfully!');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Billing & Invoices</h2>
                    <p className="text-slate-500 mt-1">View and download your past purchase invoices.</p>
                </div>
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                    <FileText className="w-6 h-6" />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Invoice No.</th>
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Items</th>
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Total Amount</th>
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {invoices?.content?.map((invoice) => (
                            <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 font-mono text-sm text-indigo-600 font-medium">#{invoice.invoiceNumber}</td>
                                <td className="p-4 text-sm text-slate-600">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                                <td className="p-4 text-sm text-slate-600">
                                    {invoice.items.map(item => item.serviceName).join(', ')}
                                </td>
                                <td className="p-4 font-bold text-slate-800">₹{invoice.totalAmount.toLocaleString()}</td>
                                <td className="p-4">
                                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        <CheckCircle className="w-3 h-3" />
                                        <span>PAID</span>
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button onClick={() => handleDownload(invoice.id)} className="px-3 py-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm font-medium transition-colors inline-flex items-center space-x-1 mr-2">
                                        <Download className="w-4 h-4" />
                                        <span>PDF</span>
                                    </button>
                                    <button onClick={() => handleEmail(invoice.id)} className="px-3 py-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm font-medium transition-colors inline-flex items-center space-x-1">
                                        <Mail className="w-4 h-4" />
                                        <span>Email</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Invoices;
