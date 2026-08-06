import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Send, Loader2, CheckCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { accountApi, transactionApi } from '@/api/accountApi'
import { beneficiaryApi } from '@/api/clientApis'
import toast from 'react-hot-toast'

const generateKey = () => Math.random().toString(36).substring(2) + Date.now().toString(36)

const schema = z.object({
  fromAccountId: z.string().min(1, 'Select account'),
  toAccountNumber: z.string().min(1, 'Enter account number'),
  amount: z.coerce.number().min(1, 'Minimum ₹1'),
  description: z.string().optional(),
  beneficiaryId: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function TransferPage() {
  const [success, setSuccess] = useState(false)
  const [txRef, setTxRef] = useState('')
  const qc = useQueryClient()

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountApi.getAll().then((r) => r.data.data),
  })

  const { data: beneficiaries = [] } = useQuery({
    queryKey: ['beneficiaries'],
    queryFn: () => beneficiaryApi.getAll().then((r) => r.data.data),
  })

  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { fromAccountId: accounts[0]?.id ?? '' },
  })

  const transferMutation = useMutation({
    mutationFn: (data: FormData) =>
      transactionApi.transfer({
        fromAccountId: data.fromAccountId,
        toAccountNumber: data.toAccountNumber,
        amount: data.amount,
        description: data.description,
        idempotencyKey: generateKey(),
        beneficiaryId: data.beneficiaryId,
      }),
    onSuccess: (res) => {
      setTxRef(res.data.data.reference)
      setSuccess(true)
      qc.invalidateQueries({ queryKey: ['accounts'] })
      qc.invalidateQueries({ queryKey: ['transactions'] })
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Transfer failed')
    },
  })

  if (success) {
    return (
      <div className="max-w-md mx-auto animate-fade-in">
        <div className="card text-center py-10">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Transfer Successful!</h2>
          <p className="text-slate-400 mt-2">Reference: <span className="font-mono text-brand-400">{txRef}</span></p>
          <button onClick={() => { setSuccess(false); reset() }} className="btn-primary mt-6 mx-auto">Make Another Transfer</button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
      <h1 className="page-title">Fund Transfer</h1>

      <div className="card">
        <form onSubmit={handleSubmit((d) => transferMutation.mutate(d))} className="space-y-5">
          <div>
            <label className="label">From Account</label>
            <select {...register('fromAccountId')} className="input">
              {accounts.filter((a) => a.status === 'ACTIVE').map((a) => (
                <option key={a.id} value={a.id}>
                  {a.accountType} — {a.accountNumber} (₹{a.balance.toFixed(2)})
                </option>
              ))}
            </select>
            {errors.fromAccountId && <p className="text-red-400 text-xs mt-1">{errors.fromAccountId.message}</p>}
          </div>

          {/* Quick-select from beneficiaries */}
          {beneficiaries.filter((b) => b.verified).length > 0 && (
            <div>
              <label className="label">Quick Select Beneficiary</label>
              <div className="flex gap-2 flex-wrap">
                {beneficiaries.filter((b) => b.verified).map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      setValue('toAccountNumber', b.accountNumber)
                      setValue('beneficiaryId', b.id)
                    }}
                    className="px-3 py-1.5 rounded-lg bg-brand-600/10 border border-brand-600/20 text-brand-400 text-xs hover:bg-brand-600/20 transition-colors"
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="label">To Account Number</label>
            <input {...register('toAccountNumber')} className="input font-mono" placeholder="NEX123456789012" />
            {errors.toAccountNumber && <p className="text-red-400 text-xs mt-1">{errors.toAccountNumber.message}</p>}
          </div>

          <div>
            <label className="label">Amount (₹)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">₹</span>
              <input {...register('amount')} type="number" step="0.01" className="input pl-8" placeholder="0.00" />
            </div>
            {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount.message}</p>}
          </div>

          {/* Quick amount buttons */}
          <div className="flex gap-2">
            {[500, 1000, 5000, 10000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setValue('amount', amt)}
                className="flex-1 py-1.5 rounded-lg bg-surface-card border border-surface-border text-slate-400 text-xs hover:border-brand-600 hover:text-brand-400 transition-colors"
              >
                ₹{amt.toLocaleString()}
              </button>
            ))}
          </div>

          <div>
            <label className="label">Description (optional)</label>
            <input {...register('description')} className="input" placeholder="Payment for..." />
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-amber-400 text-xs flex gap-2">
            <span>⚠️</span>
            <span>Transfers are irreversible. Please verify account details before proceeding.</span>
          </div>

          <button
            type="submit"
            disabled={transferMutation.isPending}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {transferMutation.isPending
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
              : <><Send className="w-4 h-4" /> Transfer Funds</>}
          </button>
        </form>
      </div>
    </div>
  )
}
