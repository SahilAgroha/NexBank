import React from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../../store/store';
import { updateUserService } from '../../../../features/admin/adminSlice';
import type { AdminUserDetailsResponse } from '../../../../features/admin/adminSlice';
import { ToggleRight, ToggleLeft } from 'lucide-react';

interface ServiceMatrixTabProps {
    user: AdminUserDetailsResponse;
}

const ServiceMatrixTab: React.FC<ServiceMatrixTabProps> = ({ user }) => {
    const dispatch = useDispatch<AppDispatch>();

    const handleToggle = (serviceId: number, currentStatus: boolean) => {
        dispatch(updateUserService({ 
            userId: user.id, 
            serviceData: { serviceId, isAuthorized: !currentStatus } 
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 tracking-tight uppercase">Merchant Identifier</h3>
                <span className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-medium border border-green-500/20">
                    Session Verified
                </span>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm mb-6 flex justify-between items-center text-sm text-gray-500 font-mono">
                <span className="truncate">dsBwWAv+HQs3OoBAf6Rc+w==</span>
                <span className="bg-gray-50 px-3 py-1 rounded-md text-gray-900 font-bold border border-gray-200">
                    Authorized Channels: {user.services.filter(s => s.authorized).length}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {user.services.map(service => (
                    <div key={service.serviceId} className="bg-white border border-gray-100 shadow-sm rounded-xl p-5 hover:border-indigo-300 transition-colors">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center border border-indigo-100">
                                {/* Placeholder icon, could be dynamic based on service name */}
                                <div className="w-5 h-5 bg-indigo-500 rounded-sm"></div>
                            </div>
                            <div>
                                <h4 className="text-gray-900 font-bold truncate">{service.serviceName}</h4>
                                <p className="text-xs text-gray-500 font-medium">Secure Node</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <span className="text-sm font-bold text-gray-700">Authorization</span>
                            <button 
                                onClick={() => handleToggle(service.serviceId, service.authorized)}
                                className={`flex items-center space-x-1 ${service.authorized ? 'text-indigo-600' : 'text-gray-400'}`}
                            >
                                {service.authorized ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ServiceMatrixTab;
