import React from 'react';

const PurchaseRecords: React.FC = () => {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 flex items-center">
                        <span className="w-8 h-8 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">🛒</span>
                        Tax & Procurement
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Audit-ready purchase ledger and GST reconciliation</p>
                </div>
            </div>

            <div className="bg-white border border-gray-100 shadow-sm rounded-lg overflow-hidden mt-6">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="text-sm font-bold text-gray-900 tracking-wider uppercase">Procurement Registry</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-medium">Ledger Details</th>
                                <th className="px-6 py-4 font-medium">Supplier</th>
                                <th className="px-6 py-4 font-medium text-right">Base (₹)</th>
                                <th className="px-6 py-4 font-medium text-right">CGST (₹)</th>
                                <th className="px-6 py-4 font-medium text-right">SGST (₹)</th>
                                <th className="px-6 py-4 font-medium text-right">IGST (₹)</th>
                                <th className="px-6 py-4 font-medium text-right">Gross Total (₹)</th>
                                <th className="px-6 py-4 font-medium text-center">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colSpan={9} className="px-6 py-12 text-center border-b border-gray-100">
                                    <div className="flex flex-col items-center justify-center text-gray-500">
                                        <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p>No purchase records found for this period.</p>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PurchaseRecords;
