import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../../store/store';
import { fetchUserDetails } from '../../../features/admin/adminSlice';
import { ArrowLeft, User, Shield, CreditCard, Activity } from 'lucide-react';
import ProfileKycTab from './tabs/ProfileKycTab';
import ServiceMatrixTab from './tabs/ServiceMatrixTab';
import CommissionEngineTab from './tabs/CommissionEngineTab';

const AdminUserDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    
    const { selectedUserDetails, loading } = useSelector((state: RootState) => state.admin);
    const [activeTab, setActiveTab] = useState<'profile' | 'services' | 'commissions'>('profile');

    useEffect(() => {
        if (id) {
            dispatch(fetchUserDetails(parseInt(id, 10)));
        }
    }, [dispatch, id]);

    if (loading || !selectedUserDetails) {
        return (
            <div className="flex h-screen items-center justify-center bg-black">
                <div className="text-white text-lg">Loading Customer Details...</div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center space-x-3">
                            <span className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                                <User className="w-6 h-6" />
                            </span>
                            <span>{selectedUserDetails.fullName}</span>
                        </h1>
                        <p className="text-gray-500 mt-1 font-medium">
                            {selectedUserDetails.role} {selectedUserDetails.partnerType ? `• ${selectedUserDetails.partnerType}` : ''} • ID: {selectedUserDetails.id}
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-4">
                    <div className="text-gray-500 text-sm font-medium">Wallet Balance</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">
                        ₹{selectedUserDetails.finance?.walletBalance?.toFixed(2) || '0.00'}
                    </div>
                </div>
                <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-4">
                    <div className="text-gray-500 text-sm font-medium">Capping Amount</div>
                    <div className="text-xl font-bold text-gray-900 mt-1">
                        ₹{selectedUserDetails.finance?.cappingAmount?.toFixed(2) || '0.00'}
                    </div>
                </div>
                <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-4">
                    <div className="text-gray-500 text-sm font-medium">Mobile Number</div>
                    <div className="text-xl font-bold text-gray-900 mt-1">
                        {selectedUserDetails.phone}
                    </div>
                </div>
                <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-4">
                    <div className="text-gray-500 text-sm font-medium">Account Status</div>
                    <div className="flex items-center space-x-2 mt-1">
                        <div className={`w-3 h-3 rounded-full ${selectedUserDetails.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                        <span className="text-lg font-bold text-gray-900">
                            {selectedUserDetails.isActive ? 'Active' : 'Disabled'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden">
                <div className="flex border-b border-gray-100 bg-gray-50">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex items-center space-x-2 px-6 py-4 font-bold transition-colors ${
                            activeTab === 'profile' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white' : 'text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        <Shield className="w-4 h-4" />
                        <span>Identity & KYC</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('services')}
                        className={`flex items-center space-x-2 px-6 py-4 font-bold transition-colors ${
                            activeTab === 'services' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white' : 'text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        <Activity className="w-4 h-4" />
                        <span>Service Matrix</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('commissions')}
                        className={`flex items-center space-x-2 px-6 py-4 font-bold transition-colors ${
                            activeTab === 'commissions' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white' : 'text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        <CreditCard className="w-4 h-4" />
                        <span>Commissions</span>
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'profile' && <ProfileKycTab user={selectedUserDetails} />}
                    {activeTab === 'services' && <ServiceMatrixTab user={selectedUserDetails} />}
                    {activeTab === 'commissions' && <CommissionEngineTab user={selectedUserDetails} />}
                </div>
            </div>
        </div>
    );
};

export default AdminUserDetails;
