import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../../store/store';
import { updateUserProfile, updateUserFinance } from '../../../../features/admin/adminSlice';
import type { AdminUserDetailsResponse } from '../../../../features/admin/adminSlice';
import { Save, CheckCircle } from 'lucide-react';

interface ProfileKycTabProps {
    user: AdminUserDetailsResponse;
}

const ProfileKycTab: React.FC<ProfileKycTabProps> = ({ user }) => {
    const dispatch = useDispatch<AppDispatch>();
    
    // Profile State
    const [profile, setProfile] = useState({
        aadhaarNumber: user.profile?.aadhaarNumber || '',
        panNumber: user.profile?.panNumber || '',
        city: user.profile?.city || '',
        state: user.profile?.state || '',
        pincode: user.profile?.pincode || '',
        completeAddress: user.profile?.completeAddress || ''
    });

    // Finance State
    const [finance, setFinance] = useState({
        virtualAccount: user.finance?.virtualAccount || '',
        virtualIfsc: user.finance?.virtualIfsc || '',
        cappingAmount: user.finance?.cappingAmount || 0
    });

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleFinanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFinance({ ...finance, [e.target.name]: e.target.name === 'cappingAmount' ? parseFloat(e.target.value) || 0 : e.target.value });
    };

    const handleSaveProfile = () => {
        dispatch(updateUserProfile({ userId: user.id, profileData: profile }));
    };

    const handleSaveFinance = () => {
        dispatch(updateUserFinance({ userId: user.id, financeData: finance }));
    };

    return (
        <div className="space-y-8">
            {/* Identity Configuration */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 tracking-tight uppercase">General Identity Configuration</h3>
                    <span className="bg-indigo-50 text-xs px-3 py-1 rounded-full text-indigo-700 font-bold border border-indigo-200">Role: {user.role}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Aadhaar Number</label>
                        <div className="flex items-center space-x-2">
                            <input 
                                type="text" name="aadhaarNumber" value={profile.aadhaarNumber} onChange={handleProfileChange}
                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-indigo-500" 
                                placeholder="Enter Aadhaar Number"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">PAN Number</label>
                        <div className="flex items-center space-x-2">
                            <input 
                                type="text" name="panNumber" value={profile.panNumber} onChange={handleProfileChange}
                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-indigo-500" 
                                placeholder="Enter PAN Number"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Full Entity Name</label>
                        <input 
                            type="text" value={user.fullName} readOnly
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-500 cursor-not-allowed font-medium" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Mobile Access</label>
                        <input 
                            type="text" value={user.phone} readOnly
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-500 cursor-not-allowed font-medium" 
                        />
                    </div>
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
                            <input 
                                type="text" name="city" value={profile.city} onChange={handleProfileChange}
                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-indigo-500" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">State</label>
                            <input 
                                type="text" name="state" value={profile.state} onChange={handleProfileChange}
                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-indigo-500" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Pincode</label>
                            <input 
                                type="text" name="pincode" value={profile.pincode} onChange={handleProfileChange}
                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-indigo-500" 
                            />
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Complete Address</label>
                        <textarea 
                            name="completeAddress" value={profile.completeAddress} onChange={handleProfileChange} rows={2}
                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-indigo-500" 
                        ></textarea>
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                        <button onClick={handleSaveProfile} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold flex items-center space-x-2 transition-colors">
                            <Save className="w-4 h-4" />
                            <span>Save Identity Config</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Financial Parameters */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 tracking-tight uppercase mb-4">Financial Parameters</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Virtual A/C</label>
                        <input 
                            type="text" name="virtualAccount" value={finance.virtualAccount || ''} onChange={handleFinanceChange}
                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-indigo-500" 
                            placeholder="e.g. YESB0..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Virtual IFSC</label>
                        <input 
                            type="text" name="virtualIfsc" value={finance.virtualIfsc || ''} onChange={handleFinanceChange}
                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-indigo-500" 
                            placeholder="e.g. YESB0000001"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Capping Amount (₹)</label>
                        <input 
                            type="number" name="cappingAmount" value={finance.cappingAmount === null ? '' : finance.cappingAmount} onChange={handleFinanceChange}
                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-indigo-500" 
                        />
                    </div>
                    <div className="md:col-span-3 flex justify-end">
                        <button onClick={handleSaveFinance} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold flex items-center space-x-2 transition-colors">
                            <Save className="w-4 h-4" />
                            <span>Save Finance Params</span>
                        </button>
                    </div>
                </div>
            </div>
            
            {/* System Access Control (Read-Only for now) */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 tracking-tight uppercase mb-4">System Access Control</h3>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-gray-700 font-bold">Customer Status (Login)</span>
                        <div className="flex items-center space-x-2">
                            <CheckCircle className={`w-5 h-5 ${user.isActive ? 'text-emerald-500' : 'text-gray-400'}`} />
                            <span className={`font-bold ${user.isActive ? 'text-emerald-600' : 'text-gray-500'}`}>{user.isActive ? 'Active' : 'Disabled'}</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-gray-700 font-bold">System KYC</span>
                        <div className="flex items-center space-x-2">
                            <CheckCircle className={`w-5 h-5 ${user.kycStatus === 'VERIFIED' ? 'text-emerald-500' : 'text-amber-500'}`} />
                            <span className={`font-bold ${user.kycStatus === 'VERIFIED' ? 'text-emerald-600' : 'text-amber-600'}`}>{user.kycStatus}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileKycTab;
