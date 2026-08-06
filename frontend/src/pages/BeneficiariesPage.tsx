import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Users, Trash2, CheckCircle, Clock, Loader2 } from 'lucide-react'
import { beneficiaryApi } from '@/api/clientApis'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function BeneficiariesPage() {
  const [showAdd, setShowAdd] = useState(false)
  const [verifyId, setVerifyId] = useState<string | null>(null)
  const [otp, setOtp] = useState('')
  const [form, setForm] = useState({ name: '', accountNumber: '', ifscCode: '', bankName: '' })
  const qc = useQueryClient()

  const { data: beneficiaries = [], isLoading } = useQuery({
    queryKey: ['beneficiaries'],
    queryFn: () => beneficiaryApi.getAll().then((r) => r.data.data),
  })

  const addMutation = useMutation({
    mutationFn: () => beneficiaryApi.add(form),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['beneficiaries'] })
      toast.success('Beneficiary added — verify via OTP sent to your email')
      setShowAdd(false)
      setVerifyId(res.data.data.id)
      setForm({ name: '', accountNumber: '', ifscCode: '', bankName: '' })
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to add beneficiary')
    },
  })

  const verifyMutation = useMutation({
    mutationFn: ({ id, otp }: { id: string; otp: string }) => beneficiaryApi.verify(id, otp),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['beneficiaries'] })
      toast.success('Beneficiary verified!')
      setVerifyId(null)
      setOtp('')
    },
    onError: () => toast.error('Invalid OTP'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => beneficiaryApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['beneficiaries'] })
      toast.success('Beneficiary removed')
    },
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Beneficiaries</h1>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Beneficiary
        </button>
      </div>

      {isLoading && <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-brand-400 animate-spin" /></div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {beneficiaries.map((b) => (
          <div key={b.id} className="card-hover flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-brand-600/15 flex items-center justify-center text-brand-400 font-bold text-sm flex-shrink-0">
              {b.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-white font-semibold truncate">{b.name}</p>
                {b.verified
                  ? <span className="badge-success"><CheckCircle className="w-3 h-3" /> Verified</span>
                  : <span className="badge-warning"><Clock className="w-3 h-3" /> Pending</span>}
              </div>
              <p className="text-slate-400 text-sm font-mono">{b.accountNumber}</p>
              {b.bankName && <p className="text-slate-500 text-xs">{b.bankName}</p>}
            </div>
            <div className="flex gap-2">
              {!b.verified && (
                <button
                  onClick={() => setVerifyId(b.id)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 text-xs border border-amber-500/20 hover:bg-amber-500/20"
                >
                  Verify
                </button>
              )}
              <button
                onClick={() => deleteMutation.mutate(b.id)}
                className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {beneficiaries.length === 0 && !isLoading && (
          <div className="col-span-2 card text-center py-12">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No beneficiaries added yet</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md animate-fade-in">
            <h2 className="text-lg font-bold text-white mb-4">Add Beneficiary</h2>
            <div className="space-y-3">
              {[
                { key: 'name', label: 'Full Name', placeholder: 'John Doe' },
                { key: 'accountNumber', label: 'Account Number', placeholder: 'NEX...' },
                { key: 'ifscCode', label: 'IFSC Code', placeholder: 'SBIN0001234' },
                { key: 'bankName', label: 'Bank Name', placeholder: 'State Bank of India' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="label">{label}</label>
                  <input
                    className="input"
                    placeholder={placeholder}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={() => addMutation.mutate()}
                disabled={addMutation.isPending || !form.name || !form.accountNumber}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verify Modal */}
      {verifyId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-sm animate-fade-in text-center">
            <h2 className="text-lg font-bold text-white mb-2">Verify Beneficiary</h2>
            <p className="text-slate-400 text-sm mb-4">Enter the OTP sent to your registered email</p>
            <input
              type="text" value={otp} onChange={(e) => setOtp(e.target.value)}
              className="input text-center text-2xl tracking-[0.5em] font-mono mb-4" maxLength={6} placeholder="000000"
            />
            <div className="flex gap-3">
              <button onClick={() => setVerifyId(null)} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={() => verifyMutation.mutate({ id: verifyId, otp })}
                disabled={verifyMutation.isPending || otp.length !== 6}
                className="btn-primary flex-1"
              >Verify</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
