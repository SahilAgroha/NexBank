import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, CreditCard, SnowflakeIcon, RefreshCw, Loader2 } from 'lucide-react'
import { accountApi } from '@/api/accountApi'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import type { AccountType } from '@/types'

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n)

export default function AccountsPage() {
  const [showCreate, setShowCreate] = useState(false)
  const [accountType, setAccountType] = useState<AccountType>('SAVINGS')
  const qc = useQueryClient()

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountApi.getAll().then((r) => r.data.data),
  })

  const createMutation = useMutation({
    mutationFn: () => accountApi.create(accountType),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['accounts'] })
      toast.success('Account opened successfully!')
      setShowCreate(false)
    },
    onError: () => toast.error('Failed to create account'),
  })

  const freezeMutation = useMutation({
    mutationFn: (id: string) => accountApi.freeze(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['accounts'] })
      toast.success('Account frozen')
    },
    onError: () => toast.error('Failed to freeze account'),
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Accounts</h1>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Open Account
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accounts.map((account) => (
          <div key={account.id} className="card-hover relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-brand-600/5 rounded-full" />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-brand-600/15">
                  <CreditCard className="w-5 h-5 text-brand-400" />
                </div>
                <span className={clsx(
                  'text-xs font-semibold px-2.5 py-1 rounded-full',
                  account.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'
                )}>
                  {account.status}
                </span>
              </div>

              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{account.accountType} Account</p>
              <p className="text-3xl font-bold text-white mt-1">{formatCurrency(account.balance)}</p>

              <div className="mt-4 pt-4 border-t border-surface-border">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Account Number</p>
                    <p className="text-white font-mono mt-0.5">{account.accountNumber}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">IFSC Code</p>
                    <p className="text-white font-mono mt-0.5">{account.ifscCode}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Branch</p>
                    <p className="text-white text-xs mt-0.5">{account.branch}</p>
                  </div>
                </div>
              </div>

              {account.status === 'ACTIVE' && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => freezeMutation.mutate(account.id)}
                    disabled={freezeMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-xs font-medium transition-colors"
                  >
                    <SnowflakeIcon className="w-3.5 h-3.5" /> Freeze Account
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {accounts.length === 0 && !isLoading && (
          <div className="col-span-2 card text-center py-12">
            <CreditCard className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No accounts yet</p>
            <p className="text-slate-500 text-sm mt-1">Open a Savings or Current account to get started</p>
            <button onClick={() => setShowCreate(true)} className="btn-primary mx-auto mt-4 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Open First Account
            </button>
          </div>
        )}
      </div>

      {/* Create Account Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md animate-fade-in">
            <h2 className="text-lg font-bold text-white mb-4">Open New Account</h2>
            <div className="space-y-3 mb-6">
              {(['SAVINGS', 'CURRENT'] as AccountType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setAccountType(type)}
                  className={clsx(
                    'w-full p-4 rounded-xl border-2 text-left transition-all',
                    accountType === type
                      ? 'border-brand-500 bg-brand-600/10'
                      : 'border-surface-border bg-surface hover:border-slate-600'
                  )}
                >
                  <p className="font-semibold text-white">{type} Account</p>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {type === 'SAVINGS' ? '4% p.a. interest • Min ₹1,000 balance' : 'Zero balance • Unlimited transactions'}
                  </p>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {createMutation.isPending ? <><RefreshCw className="w-4 h-4 animate-spin" /> Opening...</> : 'Open Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
