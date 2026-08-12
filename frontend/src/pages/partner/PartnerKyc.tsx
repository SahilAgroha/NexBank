import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store/store';
import { fetchKycStatus, uploadKycDocument, linkPartner } from '../../features/kyc/kycSlice';
import { UploadCloud, CheckCircle, AlertCircle, Clock, FileText, Building2, ShieldCheck, Briefcase } from 'lucide-react';

const PartnerKyc = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { status, documents, loading, error } = useSelector((state: RootState) => state.kyc);
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('BUSINESS_REGISTRATION');
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
      alert("Master Partner linked successfully!");
    }
  };

  const getStatusDisplay = () => {
    switch (status) {
      case 'APPROVED':
        return (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-900 p-5 shadow-sm">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-emerald-600 mr-4" />
              <div>
                <h3 className="text-lg font-bold tracking-tight">Compliance Verified</h3>
                <p className="text-emerald-800/80 text-sm mt-0.5">Your business entity is fully verified. All partner APIs and settlement features are active.</p>
              </div>
            </div>
          </div>
        );
      case 'PENDING':
        return (
          <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-900 p-5 shadow-sm">
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-amber-600 mr-4" />
              <div>
                <h3 className="text-lg font-bold tracking-tight">Under Compliance Review</h3>
                <p className="text-amber-800/80 text-sm mt-0.5">Your business documents are being reviewed by our compliance team (SLA: 24-48 hours).</p>
              </div>
            </div>
          </div>
        );
      case 'REJECTED':
        return (
          <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-900 p-5 shadow-sm">
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 text-rose-600 mr-4" />
              <div>
                <h3 className="text-lg font-bold tracking-tight">Verification Rejected</h3>
                <p className="text-rose-800/80 text-sm mt-0.5">One or more of your documents failed compliance checks. Please review the reasons below and re-upload.</p>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-slate-800 border-l-4 border-blue-500 text-white p-5 shadow-sm">
            <div className="flex items-center">
              <ShieldCheck className="h-6 w-6 text-blue-400 mr-4" />
              <div>
                <h3 className="text-lg font-bold tracking-tight">Action Required: Business KYC</h3>
                <p className="text-slate-300 text-sm mt-0.5">Upload your company registration and tax documents to activate your partner account.</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 pb-5 mb-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Building2 className="w-5 h-5 text-slate-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Partner Portal</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Compliance & KYC</h1>
          <p className="text-slate-600 mt-1 text-sm">Submit your business documentation to fulfill regulatory requirements.</p>
        </div>
      </div>

      {getStatusDisplay()}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upload Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-5">
              <UploadCloud className="w-5 h-5 text-slate-700" />
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">Submit Document</h2>
            </div>
            
            <form onSubmit={handleUpload} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Document Type</label>
                <select 
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="block w-full bg-slate-50 border border-slate-200 text-slate-800 py-2.5 px-3 text-sm focus:outline-none focus:border-slate-500 focus:ring-0 transition-colors rounded-none"
                >
                  <option value="BUSINESS_REGISTRATION">Company Registration</option>
                  <option value="TAX_ID">Tax ID (PAN/GST)</option>
                  <option value="BUSINESS_ADDRESS">Business Address Proof</option>
                  <option value="PARTNER_AGREEMENT">Signed Partner Agreement</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Document File</label>
                <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed relative transition-colors ${preview ? 'border-emerald-400 bg-emerald-50/20' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'}`}>
                  <div className="space-y-2 text-center w-full">
                    {preview ? (
                      <div>
                        <img src={preview} alt="Preview" className="mx-auto h-32 object-contain mb-3" />
                        <button 
                          type="button" 
                          onClick={() => { setFile(null); setPreview(null); }}
                          className="text-xs font-bold text-rose-600 hover:text-rose-800 uppercase tracking-wide"
                        >
                          Remove & Reselect
                        </button>
                      </div>
                    ) : (
                      <div className="py-4">
                        <UploadCloud className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                        <div className="flex justify-center text-sm text-slate-600">
                          <label htmlFor="file-upload" className="relative cursor-pointer font-bold text-slate-800 hover:text-slate-600">
                            <span>Browse files</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/jpeg, image/png, image/jpg" />
                          </label>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-wide">JPG/PNG up to 5MB</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wide">Master Partner ID (Optional)</label>
                <input
                  type="text"
                  placeholder="PRT-XXXXXX"
                  value={partnerCode}
                  onChange={(e) => setPartnerCode(e.target.value)}
                  className="w-full bg-white border border-slate-200 py-2 px-3 text-sm focus:outline-none focus:border-slate-500 uppercase font-mono mt-2"
                />
              </div>

              <button
                type="submit"
                disabled={!file || loading}
                className={`w-full py-3 px-4 text-sm font-bold text-white uppercase tracking-wider transition-colors ${
                  !file || loading ? 'bg-slate-300 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                {loading ? 'Processing...' : 'Upload to Compliance'}
              </button>
            </form>
          </div>
        </div>

        {/* Data Table / Documents List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-slate-700" />
                <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">Submitted Documents</h2>
              </div>
              <span className="text-xs font-medium bg-slate-200 text-slate-700 px-2 py-1 rounded">Total: {documents.length}</span>
            </div>
            
            {documents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Document</th>
                      <th scope="col" className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Type</th>
                      <th scope="col" className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date Submitted</th>
                      <th scope="col" className="px-6 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <a href={doc.documentUrl} target="_blank" rel="noreferrer">
                            <img src={doc.documentUrl} alt="Doc" className="h-10 w-14 object-cover border border-slate-200 cursor-pointer hover:opacity-80" />
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                          {doc.documentType.replace('_', ' ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider
                            ${doc.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 
                              doc.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 
                              'bg-amber-100 text-amber-800'}`}
                          >
                            {doc.status}
                          </span>
                          {doc.rejectionReason && (
                            <div className="mt-1 text-[10px] text-rose-600 max-w-[150px] truncate" title={doc.rejectionReason}>
                              {doc.rejectionReason}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FileText className="h-12 w-12 text-slate-200 mb-3" />
                <h3 className="text-sm font-medium text-slate-900">No documents submitted</h3>
                <p className="text-xs text-slate-500 mt-1">Submit your business documents to begin compliance review.</p>
              </div>
            )}
          </div>

          {/* Master Partner Linking */}
          <div className="bg-slate-900 p-6 border border-slate-800 shadow-sm text-white">
            <h2 className="text-sm font-bold uppercase tracking-wide mb-2 flex items-center">
              <Building2 className="w-4 h-4 mr-2 text-slate-400" />
              Link Master Partner
            </h2>
            <p className="text-slate-400 text-xs mb-4">If your business operates under a Master Partner, link their ID below.</p>
            <form onSubmit={handleLinkPartner} className="flex gap-3">
              <input
                type="text"
                placeholder="Master Partner ID"
                value={partnerCodeForLink}
                onChange={(e) => setPartnerCodeForLink(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 py-2 px-3 text-sm focus:outline-none focus:border-slate-500 font-mono uppercase"
              />
              <button
                type="submit"
                disabled={!partnerCodeForLink || loading}
                className="py-2 px-4 bg-white text-slate-900 text-xs font-bold uppercase tracking-wider hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerKyc;
