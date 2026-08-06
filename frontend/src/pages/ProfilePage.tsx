import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserCircle, MapPin, Users, FileCheck, Upload, Loader2, CheckCircle } from 'lucide-react'
import { customerApi } from '@/api/clientApis'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import type { KycStatus } from '@/types'

const kycStatusStyle: Record<KycStatus, string> = {
  PENDING: 'badge-warning',
  SUBMITTED: 'badge-info',
  VERIFIED: 'badge-success',
  REJECTED: 'badge-danger',
}

type Tab = 'profile' | 'address' | 'nominee' | 'kyc'

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [kycType, setKycType] = useState('PAN')
  const [kycFile, setKycFile] = useState<File | null>(null)
  const qc = useQueryClient()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => customerApi.getProfile().then((r) => r.data.data),
  })

  const [profileForm, setProfileForm] = useState({
    firstName: '', lastName: '', dateOfBirth: '', gender: '',
    panNumber: '', aadharNumber: '', occupation: ''
  })

  const updateProfileMutation = useMutation({
    mutationFn: () => customerApi.updateProfile({ ...profileForm }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['profile'] }); toast.success('Profile updated!') },
    onError: () => toast.error('Failed to update profile'),
  })

  const [addressForm, setAddressForm] = useState({ line1: '', line2: '', city: '', state: '', pincode: '', country: 'India' })

  const updateAddressMutation = useMutation({
    mutationFn: () => customerApi.updateAddress(addressForm),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['profile'] }); toast.success('Address updated!') },
    onError: () => toast.error('Failed to update address'),
  })

  const [nomineeForm, setNomineeForm] = useState({ name: '', relation: '', dateOfBirth: '', phone: '' })

  const updateNomineeMutation = useMutation({
    mutationFn: () => customerApi.updateNominee(nomineeForm),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['profile'] }); toast.success('Nominee updated!') },
  })

  const uploadKycMutation = useMutation({
    mutationFn: () => customerApi.uploadKyc(kycType, kycFile!),
    onSuccess: () => { toast.success('KYC document uploaded for review'); setKycFile(null) },
    onError: () => toast.error('Upload failed'),
  })

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'profile', label: 'Personal Info', icon: UserCircle },
    { id: 'address', label: 'Address', icon: MapPin },
    { id: 'nominee', label: 'Nominee', icon: Users },
    { id: 'kyc', label: 'KYC Documents', icon: FileCheck },
  ]

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-brand-400 animate-spin" /></div>

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center text-white text-2xl font-bold glow-brand">
          {profile?.firstName[0]}{profile?.lastName[0]}
        </div>
        <div>
          <h1 className="page-title">{profile?.firstName} {profile?.lastName}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={kycStatusStyle[profile?.kycStatus ?? 'PENDING']}>
              {profile?.kycStatus === 'VERIFIED' && <CheckCircle className="w-3 h-3" />}
              KYC: {profile?.kycStatus}
            </span>
            <span className="text-slate-500 text-sm">{profile?.email}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-card rounded-xl border border-surface-border overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
              activeTab === id ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
            )}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="card space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'firstName', label: 'First Name', def: profile?.firstName },
              { key: 'lastName', label: 'Last Name', def: profile?.lastName },
              { key: 'dateOfBirth', label: 'Date of Birth', def: profile?.dateOfBirth, type: 'date' },
              { key: 'gender', label: 'Gender', def: profile?.gender },
              { key: 'panNumber', label: 'PAN Number', def: profile?.panNumber },
              { key: 'aadharNumber', label: 'Aadhar Number', def: profile?.aadharNumber },
              { key: 'occupation', label: 'Occupation', def: profile?.occupation },
            ].map(({ key, label, def, type }) => (
              <div key={key} className={key === 'occupation' ? 'col-span-2' : ''}>
                <label className="label">{label}</label>
                <input
                  type={type || 'text'}
                  className="input"
                  defaultValue={def ?? ''}
                  onChange={(e) => setProfileForm({ ...profileForm, [key]: e.target.value })}
                />
              </div>
            ))}
          </div>
          <button
            onClick={() => updateProfileMutation.mutate()}
            disabled={updateProfileMutation.isPending}
            className="btn-primary flex items-center gap-2"
          >
            {updateProfileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save Changes
          </button>
        </div>
      )}

      {/* Address Tab */}
      {activeTab === 'address' && (
        <div className="card space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'line1', label: 'Address Line 1', col: 2, def: profile?.address?.line1 },
              { key: 'line2', label: 'Address Line 2', col: 2, def: profile?.address?.line2 },
              { key: 'city', label: 'City', col: 1, def: profile?.address?.city },
              { key: 'state', label: 'State', col: 1, def: profile?.address?.state },
              { key: 'pincode', label: 'Pincode', col: 1, def: profile?.address?.pincode },
              { key: 'country', label: 'Country', col: 1, def: profile?.address?.country ?? 'India' },
            ].map(({ key, label, col, def }) => (
              <div key={key} className={col === 2 ? 'col-span-2' : ''}>
                <label className="label">{label}</label>
                <input className="input" defaultValue={def ?? ''} onChange={(e) => setAddressForm({ ...addressForm, [key]: e.target.value })} />
              </div>
            ))}
          </div>
          <button onClick={() => updateAddressMutation.mutate()} disabled={updateAddressMutation.isPending} className="btn-primary">Save Address</button>
        </div>
      )}

      {/* Nominee Tab */}
      {activeTab === 'nominee' && (
        <div className="card space-y-4">
          {[
            { key: 'name', label: 'Nominee Full Name', def: profile?.nominee?.name },
            { key: 'relation', label: 'Relation', def: profile?.nominee?.relation },
            { key: 'dateOfBirth', label: 'Date of Birth', def: profile?.nominee?.dateOfBirth, type: 'date' },
            { key: 'phone', label: 'Phone Number', def: profile?.nominee?.phone },
          ].map(({ key, label, def, type }) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input type={type || 'text'} className="input" defaultValue={def ?? ''} onChange={(e) => setNomineeForm({ ...nomineeForm, [key]: e.target.value })} />
            </div>
          ))}
          <button onClick={() => updateNomineeMutation.mutate()} disabled={updateNomineeMutation.isPending} className="btn-primary">Save Nominee</button>
        </div>
      )}

      {/* KYC Tab */}
      {activeTab === 'kyc' && (
        <div className="card space-y-4">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <span className="text-amber-400 text-sm">📋 Upload government-issued documents for KYC verification.</span>
          </div>
          <div>
            <label className="label">Document Type</label>
            <select value={kycType} onChange={(e) => setKycType(e.target.value)} className="input">
              {['PAN', 'AADHAR', 'PASSPORT', 'DRIVING_LICENSE', 'UTILITY_BILL'].map((t) => (
                <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Upload Document</label>
            <div
              className="border-2 border-dashed border-surface-border rounded-xl p-8 text-center cursor-pointer hover:border-brand-600 transition-colors"
              onClick={() => document.getElementById('kyc-upload')?.click()}
            >
              <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">{kycFile ? kycFile.name : 'Click to upload (JPG, PNG, PDF)'}</p>
              <input id="kyc-upload" type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => setKycFile(e.target.files?.[0] ?? null)} />
            </div>
          </div>
          <button
            onClick={() => uploadKycMutation.mutate()}
            disabled={uploadKycMutation.isPending || !kycFile}
            className="btn-primary flex items-center gap-2"
          >
            {uploadKycMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Upload Document
          </button>
        </div>
      )}
    </div>
  )
}
