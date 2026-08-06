import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown, CreditCard, ArrowUpRight, Wallet, Bell } from 'lucide-react'
import { accountApi, transactionApi } from '@/api/accountApi'
import { useAuthStore } from '@/store/authStore'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import clsx from 'clsx'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount)

export default function DashboardPage() {
  const { user } = useAuthStore()

  const { data: accountsData } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountApi.getAll().then((r) => r.data.data),
  })

  const primaryAccount = accountsData?.[0]

  const { data: txData } = useQuery({
    queryKey: ['transactions', primaryAccount?.id],
    queryFn: () =>
      primaryAccount
        ? transactionApi.getHistory(primaryAccount.id, 0, 5).then((r) => r.data.data.content)
        : Promise.resolve([]),
    enabled: !!primaryAccount,
  })

  const totalBalance = accountsData?.reduce((sum, a) => sum + a.balance, 0) ?? 0

  // Mock chart data — in production this would come from the ledger
  const chartData = Array.from({ length: 7 }, (_, i) => ({
    day: format(new Date(Date.now() - (6 - i) * 86400000), 'EEE'),
    balance: totalBalance * (0.85 + Math.random() * 0.3),
  }))

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">Good morning,</p>
          <h1 className="page-title">{user?.firstName} {user?.lastName} 👋</h1>
        </div>
        <Link to="/notifications" className="relative p-2 rounded-xl bg-surface-card border border-surface-border hover:border-brand-600 transition-colors">
          <Bell className="w-5 h-5 text-slate-400" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-600 rounded-full text-xs flex items-center justify-center">3</span>
        </Link>
      </div>

      {/* Total Balance Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-brand p-6 glow-brand">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-x-8 -translate-y-32" />
        <div className="relative z-10">
          <p className="text-indigo-200 text-sm font-medium">Total Balance</p>
          <p className="text-4xl font-bold text-white mt-1">{formatCurrency(totalBalance)}</p>
          <p className="text-indigo-300 text-sm mt-2">{accountsData?.length ?? 0} account{accountsData?.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="relative z-10 mt-4 flex gap-3">
          <Link to="/transfer" className="flex items-center gap-2 bg-white/15 hover:bg-white/25 px-4 py-2 rounded-xl text-white text-sm font-medium transition-colors">
            <ArrowUpRight className="w-4 h-4" /> Transfer
          </Link>
          <Link to="/payments" className="flex items-center gap-2 bg-white/15 hover:bg-white/25 px-4 py-2 rounded-xl text-white text-sm font-medium transition-colors">
            <Wallet className="w-4 h-4" /> Pay
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {accountsData?.slice(0, 3).map((account) => (
          <Link key={account.id} to="/accounts" className="stat-card hover:border-brand-600/50 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-xl bg-brand-600/15">
                <CreditCard className="w-4 h-4 text-brand-400" />
              </div>
              <span className={clsx(
                'text-xs font-semibold px-2 py-0.5 rounded-full',
                account.status === 'ACTIVE' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
              )}>
                {account.status}
              </span>
            </div>
            <p className="text-slate-400 text-xs">{account.accountType} Account</p>
            <p className="text-white font-bold text-lg mt-1">{formatCurrency(account.balance)}</p>
            <p className="text-slate-500 text-xs font-mono mt-1">{account.accountNumber}</p>
          </Link>
        ))}
      </div>

      {/* Chart */}
      <div className="card">
        <h2 className="section-title mb-4">Balance Trend</h2>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f1f5f9' }}
              formatter={(v: number) => [formatCurrency(v), 'Balance']}
            />
            <Area type="monotone" dataKey="balance" stroke="#4f46e5" strokeWidth={2} fill="url(#balanceGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Recent Transactions</h2>
          <Link to="/transactions" className="text-brand-400 hover:text-brand-300 text-sm font-medium">View all →</Link>
        </div>
        <div className="space-y-3">
          {txData?.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-6">No transactions yet</p>
          )}
          {txData?.map((tx) => {
            const isCredit = tx.type === 'DEPOSIT' || tx.type === 'TRANSFER_CREDIT'
            return (
              <div key={tx.id} className="flex items-center justify-between py-3 border-b border-surface-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    'w-9 h-9 rounded-xl flex items-center justify-center',
                    isCredit ? 'bg-emerald-500/15' : 'bg-red-500/15'
                  )}>
                    {isCredit ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{tx.type.replace(/_/g, ' ')}</p>
                    <p className="text-slate-500 text-xs font-mono">{tx.reference}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={isCredit ? 'amount-positive' : 'amount-negative'}>
                    {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                  <p className="text-slate-500 text-xs">{format(new Date(tx.createdAt), 'dd MMM')}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
