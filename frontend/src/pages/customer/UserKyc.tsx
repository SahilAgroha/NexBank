import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store/store';
import { fetchKycStatus, uploadKycDocument, linkPartner } from '../../features/kyc/kycSlice';
import { UploadCloud, CheckCircle, AlertCircle, Clock, FileText, UserCheck, Shield } from 'lucide-react';

const UserKyc = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { status, documents, loading, error } = useSelector((state: RootState) => state.kyc);
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('ID_CARD');
  const [preview, setPreview] = useState<string | null>(null);
  const [partnerCode, setPartnerCode] = useState('');
  const [partnerCodeForLink, setPartnerCodeForLink] = useState('');

  useEffect(() => {
    dispatch(fetchKycStatus());
  }, [dispatch]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      dispatch(uploadKycDocument({ file, documentType, partnerCode }));
      setFile(null);
      setPreview(null);
    }
  };

  const handleLinkPartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (partnerCodeForLink) {
      dispatch(linkPartner(partnerCodeForLink));
      setPartnerCodeForLink('');
      alert("Partner linked successfully!");
    }
  };

  const getStatusDisplay = () => {
    switch (status) {
      case 'APPROVED':
        return (
          <div className="bg-gradient-to-r from-emerald-50 to-green-100 border border-green-200 text-green-800 p-6 rounded-2xl flex items-center shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-green-200 opacity-20 rounded-full blur-xl"></div>
            <div className="bg-green-100 p-3 rounded-full mr-5 shadow-sm">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">Identity Verified</h3>
              <p className="text-green-700/80 mt-1">Your account is fully verified. You can now add and transfer money seamlessly.</p>
            </div>
          </div>
        );
      case 'PENDING':
        return (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-100 border border-yellow-200 text-yellow-800 p-6 rounded-2xl flex items-center shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-yellow-200 opacity-20 rounded-full blur-xl"></div>
            <div className="bg-yellow-100 p-3 rounded-full mr-5 shadow-sm">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">Verification Pending</h3>
              <p className="text-yellow-700/80 mt-1">We are reviewing your documents. This usually takes less than 24 hours.</p>
            </div>
          </div>
        );
      case 'REJECTED':
        return (
          <div className="bg-gradient-to-r from-rose-50 to-red-100 border border-red-200 text-red-800 p-6 rounded-2xl flex items-center shadow-sm relative overflow-hidden">
            <div className="bg-red-100 p-3 rounded-full mr-5 shadow-sm">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">Verification Rejected</h3>
              <p className="text-red-700/80 mt-1">We could not verify your identity. Please upload clearer documents.</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-gradient-to-r from-indigo-50 to-blue-100 border border-blue-200 text-blue-800 p-6 rounded-2xl flex items-center shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-200 opacity-20 rounded-full blur-xl"></div>
            <div className="bg-blue-100 p-3 rounded-full mr-5 shadow-sm">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">Action Required: Verify Identity</h3>
              <p className="text-blue-700/80 mt-1">Unlock your wallet by uploading a valid government ID.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Identity Verification</h1>
          <p className="text-slate-500 mt-2 text-lg">Secure your account and unlock financial features.</p>
        </div>
        <div className="hidden md:flex bg-blue-50 text-blue-600 px-4 py-2 rounded-full items-center font-medium shadow-sm border border-blue-100">
          <UserCheck className="w-5 h-5 mr-2" />
          Consumer KYC
        </div>
      </div>

      {getStatusDisplay()}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center animate-in fade-in">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Upload Column */}
        <div className="xl:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center space-x-3 mb-6 border-b border-slate-50 pb-4">
              <div className="bg-indigo-50 p-2 rounded-lg">
                <UploadCloud className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Upload Document</h2>
            </div>
            
            <form onSubmit={handleUpload} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Select Document Type</label>
                <div className="relative">
                  <select 
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="block w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-3 px-4 pr-8 rounded-xl leading-tight focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all cursor-pointer font-medium"
                  >
                    <option value="ID_CARD">National ID Card</option>
                    <option value="PASSPORT">Passport</option>
                    <option value="DRIVING_LICENSE">Driving License</option>
                    <option value="UTILITY_BILL">Utility Bill</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Upload Front Image</label>
                <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-2xl relative transition-all duration-200 ${preview ? 'border-indigo-300 bg-indigo-50/30' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}`}>
                  <div className="space-y-2 text-center w-full">
                    {preview ? (
                      <div className="relative group">
                        <img src={preview} alt="Preview" className="mx-auto h-48 object-contain rounded-lg shadow-sm" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <button 
                            type="button" 
                            onClick={() => { setFile(null); setPreview(null); }}
                            className="bg-white text-red-600 font-medium px-4 py-2 rounded-lg shadow-sm hover:bg-red-50 transition-colors"
                          >
                            Remove Image
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8">
                        <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                          <UploadCloud className="h-8 w-8 text-indigo-500" />
                        </div>
                        <div className="flex justify-center text-sm text-slate-600">
                          <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-semibold text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                            <span>Click to browse</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/jpeg, image/png, image/jpg" />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-slate-500 mt-2 font-medium">JPEG, PNG up to 5MB</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <label className="block text-sm font-bold text-slate-700 mb-1">Got an Invite Code?</label>
                <p className="text-xs text-slate-500 mb-3">If a partner referred you, enter their code here during upload to link your account.</p>
                <input
                  type="text"
                  placeholder="e.g. PRT-8F39A1"
                  value={partnerCode}
                  onChange={(e) => setPartnerCode(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors uppercase font-mono tracking-wider"
                />
              </div>

              <button
                type="submit"
                disabled={!file || loading}
                className={`w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-base font-bold text-white transition-all active:scale-[0.98] ${
                  !file || loading ? 'bg-indigo-300 cursor-not-allowed shadow-none' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30 shadow-lg'
                }`}
              >
                {loading ? 'Uploading safely...' : 'Submit for Verification'}
              </button>
            </form>
          </div>
        </div>

        {/* Side Column */}
        <div className="space-y-8">
          
          {/* Documents List */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-slate-400" />
              Your Documents
            </h2>
            
            {documents.length > 0 ? (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="group relative bg-slate-50 border border-slate-100 rounded-2xl p-4 hover:border-indigo-200 hover:shadow-md transition-all">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center">
                        <img src={doc.documentUrl} alt="Document" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <p className="text-sm font-bold text-slate-800 truncate">
                          {doc.documentType.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                        
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                            ${doc.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                              doc.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 
                              'bg-yellow-100 text-yellow-700'}`}
                          >
                            {doc.status}
                          </span>
                        </div>
                        {doc.rejectionReason && (
                          <p className="text-xs font-medium text-red-500 mt-2 bg-red-50 p-2 rounded-lg">Reason: {doc.rejectionReason}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                <FileText className="h-10 w-10 text-slate-300 mb-3" />
                <p className="text-sm text-slate-500 font-medium">No documents yet.</p>
              </div>
            )}
          </div>

          {/* Link Partner Widget */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl shadow-xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl"></div>
            <h2 className="text-lg font-bold mb-2">Have a Referral Code?</h2>
            <p className="text-slate-400 text-sm mb-5">Link your account to a partner to access specialized features.</p>
            <form onSubmit={handleLinkPartner} className="space-y-3">
              <input
                type="text"
                placeholder="Partner Code (PRT-XXX)"
                value={partnerCodeForLink}
                onChange={(e) => setPartnerCodeForLink(e.target.value)}
                className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all font-mono uppercase"
              />
              <button
                type="submit"
                disabled={!partnerCodeForLink || loading}
                className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Link Account
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserKyc;
