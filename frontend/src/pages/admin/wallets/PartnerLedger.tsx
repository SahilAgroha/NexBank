import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../store/store';
import { fetchPartnerLedger, fetchAdminPartners } from '../../../features/admin/adminSlice';
import LedgerTable from '../../../components/admin/LedgerTable';

const PartnerLedger: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { partnerLedger, partners, loading } = useSelector((state: RootState) => state.admin);
    const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
    const [selectedPartnerId, setSelectedPartnerId] = useState<number | ''>('');

    // Load partners for the dropdown
    useEffect(() => {
        dispatch(fetchAdminPartners({ page: 0, size: 100 }));
    }, [dispatch]);

    useEffect(() => {
        if (selectedPartnerId) {
            dispatch(fetchPartnerLedger({
                partnerId: Number(selectedPartnerId),
                startDate: dateRange.startDate ? new Date(dateRange.startDate).toISOString() : undefined,
                endDate: dateRange.endDate ? new Date(dateRange.endDate).toISOString() : undefined
            }));
        }
    }, [dispatch, dateRange, selectedPartnerId]);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDateRange(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 flex items-center">
                        <span className="w-8 h-8 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">💼</span>
                        Partner Settlement
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Wallet-level clearing and transaction audit</p>
                </div>
                
                <div className="flex flex-wrap gap-4">
                    <div className="flex flex-col">
                        <label className="text-xs font-medium text-gray-500 mb-1">Select Partner</label>
                        <select
                            value={selectedPartnerId}
                            onChange={(e) => setSelectedPartnerId(e.target.value ? Number(e.target.value) : '')}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:border-indigo-500 min-w-[200px]"
                        >
                            <option value="">-- Select Partner --</option>
                            {partners.content.map(p => (
                                <option key={p.id} value={p.id}>{p.fullName} ({p.email})</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label className="text-xs font-medium text-gray-500 mb-1">Start Date</label>
                        <input 
                            type="date" 
                            name="startDate"
                            value={dateRange.startDate}
                            onChange={handleDateChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-xs font-medium text-gray-500 mb-1">End Date</label>
                        <input 
                            type="date" 
                            name="endDate"
                            value={dateRange.endDate}
                            onChange={handleDateChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                </div>
            </div>

            {!selectedPartnerId ? (
                <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg mt-6 bg-gray-50">
                    Please select a partner to view their ledger.
                </div>
            ) : loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            ) : partnerLedger ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-indigo-100"></div>
                            <p className="text-sm font-medium text-gray-500 mb-2">Opening Balance</p>
                            <h3 className="text-2xl font-bold text-gray-900">
                                ₹{partnerLedger.openingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </h3>
                        </div>
                        
                        <div className="bg-white p-6 rounded-lg border border-emerald-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-emerald-100"></div>
                            <p className="text-sm font-medium text-gray-500 mb-2">Total Received (Credits)</p>
                            <h3 className="text-2xl font-bold text-emerald-600">
                                + ₹{partnerLedger.totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </h3>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-rose-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-rose-100"></div>
                            <p className="text-sm font-medium text-gray-500 mb-2">Total Sent (Debits)</p>
                            <h3 className="text-2xl font-bold text-rose-600">
                                - ₹{partnerLedger.totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </h3>
                        </div>

                        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-blue-100"></div>
                            <p className="text-sm font-medium text-gray-500 mb-2">Current Balance</p>
                            <h3 className="text-2xl font-bold text-gray-900">
                                ₹{partnerLedger.closingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </h3>
                        </div>
                    </div>

                    <LedgerTable transactions={partnerLedger.transactions} />
                </>
            ) : (
                <div className="text-center py-12 text-gray-500">
                    Unable to load partner ledger data.
                </div>
            )}
        </div>
    );
};

export default PartnerLedger;
