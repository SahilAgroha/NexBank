import React from 'react';

const AdminInvoices: React.FC = () => {
    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 flex items-center">
                        <span className="w-8 h-8 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">🧾</span>
                        Invoice Archive
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Automated tax invoices and billing receipts for partners</p>
                </div>
            </div>

            <div className="mt-8 bg-white border border-gray-100 shadow-sm rounded-xl p-12 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4 border border-indigo-100">
                    <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Automated Invoicing Coming Soon</h2>
                <p className="text-gray-500 max-w-md">
                    We are currently integrating GST-compliant automated invoicing. Once complete, all partner service charges, commissions, and tax deductions will generate downloadable invoices here.
                </p>
            </div>
        </div>
    );
};

export default AdminInvoices;
