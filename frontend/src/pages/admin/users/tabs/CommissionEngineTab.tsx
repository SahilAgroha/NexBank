import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../../store/store';
import { updateUserCommission } from '../../../../features/admin/adminSlice';
import type { AdminUserDetailsResponse } from '../../../../features/admin/adminSlice';
import { Save, Lock, Unlock } from 'lucide-react';

interface CommissionEngineTabProps {
    user: AdminUserDetailsResponse;
}

const CommissionEngineTab: React.FC<CommissionEngineTabProps> = ({ user }) => {
    const dispatch = useDispatch<AppDispatch>();
    
    // Local state for edits
    const [edits, setEdits] = useState<{
        [key: number]: { yieldType: string; yieldValue: number; active: boolean }
    }>({});

    const handleEditChange = (serviceId: number, field: string, value: any) => {
        setEdits(prev => ({
            ...prev,
            [serviceId]: {
                ...prev[serviceId] || user.commissions.find(c => c.serviceId === serviceId) || { yieldType: 'PERCENTAGE', yieldValue: 0, active: false },
                [field]: value
            }
        }));
    };

    const handleSave = (serviceId: number) => {
        const data = edits[serviceId];
        if (data) {
            dispatch(updateUserCommission({
                userId: user.id,
                commissionData: { serviceId, ...data }
            }));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 tracking-tight uppercase">Commission Matrix</h3>
                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-200">
                    Live Status: Running
                </span>
            </div>

            <div className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-bold tracking-wider">
                                <th className="px-6 py-4">#</th>
                                <th className="px-6 py-4">Product Specification</th>
                                <th className="px-6 py-4">Yield Type</th>
                                <th className="px-6 py-4">Value</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {user.commissions.map((comm, index) => {
                                const current = edits[comm.serviceId] || comm;
                                const isEdited = !!edits[comm.serviceId];

                                return (
                                    <tr key={comm.serviceId} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-gray-500 font-medium">{index + 1}</td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-900 font-bold">{comm.serviceName}</div>
                                            <div className="text-xs text-gray-500 font-medium mt-1">ID: {comm.serviceId}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select 
                                                value={current.yieldType}
                                                onChange={(e) => handleEditChange(comm.serviceId, 'yieldType', e.target.value)}
                                                className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-gray-900 text-sm focus:outline-none focus:border-indigo-500"
                                            >
                                                <option value="PERCENTAGE">%</option>
                                                <option value="FLAT">₹ (Flat)</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-gray-500 font-medium">{current.yieldType === 'FLAT' ? '₹' : ''}</span>
                                                <input 
                                                    type="number"
                                                    value={current.yieldValue}
                                                    onChange={(e) => handleEditChange(comm.serviceId, 'yieldValue', parseFloat(e.target.value) || 0)}
                                                    className="w-24 bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-gray-900 text-sm focus:outline-none focus:border-indigo-500 font-medium"
                                                />
                                                <span className="text-gray-500 font-medium">{current.yieldType === 'PERCENTAGE' ? '%' : ''}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={() => handleEditChange(comm.serviceId, 'active', !current.active)}
                                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${current.active ? 'bg-indigo-600' : 'bg-gray-300'}`}
                                            >
                                                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${current.active ? 'translate-x-5' : 'translate-x-1'}`} />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={() => handleSave(comm.serviceId)}
                                                disabled={!isEdited}
                                                className={`p-2 rounded-lg transition-colors ${
                                                    isEdited ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm' : 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-200'
                                                }`}
                                            >
                                                {isEdited ? <Save className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            
                            {user.commissions.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        No product specifications found. Configure Service Products first.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CommissionEngineTab;
