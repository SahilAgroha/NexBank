import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store/store';
import { fetchPartnerPendingKycUsers, fetchPartnerApprovedKycUsers, fetchPartnerUnverifiedUsers, approvePartnerKyc, rejectPartnerKyc, sendPartnerKycRequest, suspendPartnerKyc } from '../../features/kyc/kycSlice';
import api from '../../api/api';
import { CheckCircle, XCircle, AlertTriangle, Eye, ShieldCheck, History, Send, Calendar } from 'lucide-react';

const PartnerCustomerKyc = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { pendingUsers, approvedUsers, unverifiedUsers, loading } = useSelector((state: RootState) => state.kyc);
  
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REQUEST'>('PENDING');
  
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userDocuments, setUserDocuments] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  
  // Request KYC State
  const [requestUserId, setRequestUserId] = useState<number | ''>('');
  const [requestDueDate, setRequestDueDate] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);
  const [suspendingId, setSuspendingId] = useState<number | null>(null);

  useEffect(() => {
    if (activeTab === 'PENDING') {
      dispatch(fetchPartnerPendingKycUsers());
    } else if (activeTab === 'APPROVED') {
      dispatch(fetchPartnerApprovedKycUsers());
    } else if (activeTab === 'REQUEST') {
      dispatch(fetchPartnerUnverifiedUsers());
    }
    
    // Clear selection on tab change
    setSelectedUser(null);
    setUserDocuments([]);
  }, [dispatch, activeTab]);

  const handleSelectUser = async (user: any) => {
    setSelectedUser(user);
    setLoadingDocs(true);
    try {
      const response = await api.get(`/partner/customer-kyc/documents/${user.id}`);
      setUserDocuments(response.data.data);
    } catch (error) {
      console.error('Failed to fetch documents', error);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleApprove = () => {
    if (selectedUser) {
      dispatch(approvePartnerKyc(selectedUser.id));
      setSelectedUser(null);
      setUserDocuments([]);
    }
  };

  const handleReject = () => {
    if (selectedUser && rejectReason.trim() !== '') {
      dispatch(rejectPartnerKyc({ userId: selectedUser.id, reason: rejectReason }));
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedUser(null);
      setUserDocuments([]);
    }
  };
  
  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestUserId || !requestDueDate) return;
    
    setSendingRequest(true);
    try {
      await dispatch(sendPartnerKycRequest({ userId: Number(requestUserId), dueDate: requestDueDate, message: requestMessage })).unwrap();
      alert('KYC Request notification sent successfully!');
      setRequestUserId('');
      setRequestDueDate('');
      setRequestMessage('');
    } catch (err: any) {
      alert(err || 'Failed to send request');
    } finally {
      setSendingRequest(false);
    }
  };

  const handleSuspendKyc = async (userId: number) => {
    if (!window.confirm("Are you sure you want to suspend this user's KYC immediately? This will restrict their account access until they re-verify.")) return;
    
    setSuspendingId(userId);
    try {
      const reason = window.prompt("Reason for suspension (optional):", "Your KYC has been suspended by an administrator and requires re-verification.");
      if (reason === null) {
          setSuspendingId(null);
          return;
      }
      await dispatch(suspendPartnerKyc({ userId, reason })).unwrap();
      alert('KYC Suspended successfully!');
      dispatch(fetchPartnerUnverifiedUsers());
      dispatch(fetchPartnerApprovedKycUsers());
    } catch (err: any) {
      alert(err || 'Failed to suspend KYC');
    } finally {
      setSuspendingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer KYC Approval</h1>
          <p className="text-sm text-gray-500 mt-1">Review your customers' KYC, check approved history, and request compliance updates.</p>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`${
              activeTab === 'PENDING'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            Pending Approvals
            {pendingUsers.length > 0 && activeTab !== 'PENDING' && (
               <span className="ml-2 bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs">{pendingUsers.length}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('APPROVED')}
            className={`${
              activeTab === 'APPROVED'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <History className="mr-2 h-4 w-4" />
            Approved History
          </button>
          <button
            onClick={() => setActiveTab('REQUEST')}
            className={`${
              activeTab === 'REQUEST'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <Send className="mr-2 h-4 w-4" />
            Send KYC Request
          </button>
        </nav>
      </div>

      {activeTab === 'REQUEST' && (
        <div className="space-y-8 mt-6">
          <div className="bg-white shadow rounded-lg border border-gray-100 p-6 max-w-2xl mx-auto">
             <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
               <Send className="h-5 w-5 text-blue-500 mr-2" />
               Send Compliance Request
             </h3>
           <p className="text-sm text-gray-500 mb-6">
             Select a user to send a KYC update request and specify a deadline. This is useful for re-verifying approved users or reminding unverified ones. They will receive a notification in their dashboard.
           </p>
           
           <form onSubmit={handleSendRequest} className="space-y-6">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Select User/Partner</label>
               <select 
                  value={requestUserId} 
                  onChange={(e) => setRequestUserId(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2.5 focus:ring-blue-500 focus:border-blue-500"
                  required
               >
                 <option value="">-- Select a User --</option>
                 {unverifiedUsers.map(u => (
                   <option key={u.id} value={u.id}>
                     {u.fullName} ({u.email}) - {u.role} 
                     [{u.kycStatus === 'APPROVED' ? 'RE-KYC' : u.kycStatus === 'REJECTED' ? 'REJECTED' : 'NOT DONE KYC'}]
                   </option>
                 ))}
               </select>
               {unverifiedUsers.length === 0 && !loading && (
                 <p className="text-xs text-green-600 mt-1">Everyone currently has a Pending request!</p>
               )}
             </div>
             
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
               <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <Calendar className="h-4 w-4 text-gray-400" />
                 </div>
                 <input 
                    type="date" 
                    value={requestDueDate}
                    onChange={(e) => setRequestDueDate(e.target.value)}
                    className="w-full pl-10 border border-gray-300 rounded-md shadow-sm p-2.5 focus:ring-blue-500 focus:border-blue-500"
                    required
                 />
               </div>
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Request Message (Optional)</label>
               <textarea 
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="e.g. Please provide your business registration certificate."
                  rows={3}
                  className="w-full border border-gray-300 rounded-md shadow-sm p-2.5 focus:ring-blue-500 focus:border-blue-500"
               />
             </div>
             
             <div className="pt-2">
               <button 
                  type="submit" 
                  disabled={sendingRequest || !requestUserId}
                  className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
               >
                 {sendingRequest ? 'Sending...' : 'Send Request Notification'}
               </button>
             </div>
           </form>
          </div>

          {/* Table of Users Eligible for Request */}
          <div className="bg-white shadow rounded-lg border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">User Compliance Status Overview</h3>
              <span className="text-sm text-gray-500">Total: {unverifiedUsers.length} users</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User Details</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Current Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Request Type</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {unverifiedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.kycStatus === 'APPROVED' ? (
                          <span className="text-sm font-bold text-green-600 flex items-center"><CheckCircle className="w-4 h-4 mr-1"/> Approved</span>
                        ) : user.kycStatus === 'REJECTED' ? (
                          <span className="text-sm font-bold text-red-600 flex items-center"><XCircle className="w-4 h-4 mr-1"/> Rejected</span>
                        ) : (
                          <span className="text-sm font-bold text-gray-500 flex items-center"><AlertTriangle className="w-4 h-4 mr-1"/> Not Done (Unverified)</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.kycStatus === 'APPROVED' ? (
                          <span className="text-blue-600 font-medium">Re-KYC Request</span>
                        ) : (
                          <span className="text-yellow-600 font-medium">Initial KYC Request</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {user.kycStatus === 'APPROVED' && (
                          <button
                            onClick={() => handleSuspendKyc(user.id)}
                            disabled={suspendingId === user.id}
                            className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded mr-2 disabled:opacity-50"
                          >
                            {suspendingId === user.id ? '...' : 'Suspend KYC'}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setRequestUserId(user.id);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded"
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))}
                  {unverifiedUsers.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No users available for requests (everyone might be pending).
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {(activeTab === 'PENDING' || activeTab === 'APPROVED') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: User List */}
          <div className="lg:col-span-1 bg-white shadow rounded-lg border border-gray-100 overflow-hidden flex flex-col h-[600px]">
            <div className="px-4 py-5 border-b border-gray-100 bg-gray-50 flex-shrink-0">
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                {activeTab === 'PENDING' ? (
                  <><AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" /> Pending Requests</>
                ) : (
                  <><History className="h-5 w-5 text-green-500 mr-2" /> Approved History</>
                )}
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <ul className="divide-y divide-gray-100">
                {(activeTab === 'PENDING' ? pendingUsers : approvedUsers).length > 0 ? (
                  (activeTab === 'PENDING' ? pendingUsers : approvedUsers).map((user) => (
                    <li 
                      key={user.id} 
                      className={`p-4 cursor-pointer hover:bg-blue-50 transition-colors ${selectedUser?.id === user.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                      onClick={() => handleSelectUser(user)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-600 truncate">{user.fullName}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          <p className="text-xs text-gray-400 mt-1">Role: {user.role} {user.partnerType && `- ${user.partnerType}`}</p>
                          
                          {activeTab === 'APPROVED' && (
                             <p className="text-xs font-semibold text-green-600 mt-1">
                               Approved on: {new Date(user.updatedAt).toLocaleDateString()}
                             </p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            activeTab === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {activeTab === 'PENDING' ? 'Pending' : 'Approved'}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="p-8 text-center text-gray-500 text-sm">
                    {loading ? 'Loading...' : `No ${activeTab.toLowerCase()} users found.`}
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Right column: Document Review */}
          <div className="lg:col-span-2">
            {selectedUser ? (
              <div className="bg-white shadow rounded-lg border border-gray-100 overflow-hidden h-[600px] flex flex-col">
                <div className="px-4 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Reviewing: {selectedUser.fullName}
                  </h3>
                  
                  {activeTab === 'PENDING' && (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setShowRejectModal(true)}
                        className="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none"
                      >
                        <XCircle className="h-4 w-4 mr-1.5" /> Reject
                      </button>
                      <button
                        onClick={handleApprove}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                      >
                        <CheckCircle className="h-4 w-4 mr-1.5" /> Approve KYC
                      </button>
                    </div>
                  )}
                  {activeTab === 'APPROVED' && (
                     <span className="text-sm font-bold text-green-600 flex items-center">
                       <CheckCircle className="h-5 w-5 mr-1" /> Approved
                     </span>
                  )}
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                  <div className="mb-6 grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Email Address</p>
                      <p className="text-sm font-medium text-gray-900">{selectedUser.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Phone Number</p>
                      <p className="text-sm font-medium text-gray-900">{selectedUser.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Registered On</p>
                      <p className="text-sm font-medium text-gray-900">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                    </div>
                    {activeTab === 'APPROVED' && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Approved On</p>
                        <p className="text-sm font-medium text-green-600">{new Date(selectedUser.updatedAt).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>

                  <h4 className="text-md font-bold text-gray-900 mb-4 border-b pb-2">Documents</h4>
                  
                  {loadingDocs ? (
                    <div className="text-center py-10 text-gray-500 flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                      Loading documents...
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {userDocuments.map((doc, idx) => (
                        <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-semibold text-gray-700">{doc.documentType.replace('_', ' ')}</span>
                            <span className="text-xs text-gray-500">Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                          </div>
                          <div className="bg-gray-100 rounded-md p-2 flex justify-center border border-gray-300">
                            <img src={doc.documentUrl} alt="KYC Document" className="max-h-[300px] object-contain rounded" />
                          </div>
                          <div className="mt-3 flex justify-between items-center">
                            <span className={`text-xs font-bold px-2 py-1 rounded ${
                               doc.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                               doc.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                               'bg-yellow-100 text-yellow-700'
                            }`}>
                               {doc.status}
                            </span>
                            <a href={doc.documentUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                              <Eye className="h-4 w-4 mr-1" /> View Full
                            </a>
                          </div>
                        </div>
                      ))}
                      
                      {userDocuments.length === 0 && (
                        <div className="text-center py-10 text-gray-500 italic bg-gray-50 rounded-lg">
                          No documents found for this user.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg border border-gray-100 h-[600px] flex flex-col items-center justify-center p-12 text-gray-400">
                <ShieldCheck className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-lg">Select a user to review their KYC documents.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Reject KYC</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-2">
                        Please provide a reason for rejecting the documents. This will be shown to the user.
                      </p>
                      <textarea
                        rows={3}
                        className="shadow-sm focus:ring-red-500 focus:border-red-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                        placeholder="e.g. Image is blurry, ID is expired..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={rejectReason.trim() === ''}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm ${rejectReason.trim() === '' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Confirm Rejection
                </button>
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerCustomerKyc;
