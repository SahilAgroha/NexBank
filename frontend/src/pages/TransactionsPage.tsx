import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, TrendingUp, TrendingDown, ArrowLeftRight, Loader2 } from 'lucide-react'
import { accountApi, transactionApi } from '@/api/accountApi'
import { format } from 'date-fns'
import clsx from 'clsx'

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n)

export default function TransactionsPage() {
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountApi.getAll().then((r) => r.data.data),
  })

  // Set first account as default once data loads
  const effectiveAccount = selectedAccount || accounts[0]?.id || ''

  const { data: txPage, isLoading } = useQuery({
    queryKey: ['transactions', effectiveAccount, page],
    queryFn: () => transactionApi.getHistory(effectiveAccount, page, 20).then((r) => r.data.data),
    enabled: !!effectiveAccount,
  })

  const filtered = txPage?.content.filter((tx) =>
    !search || tx.reference.toLowerCase().includes(search.toLowerCase()) ||
    tx.type.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="page-title">Transaction History</h1>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <select
          value={selectedAccount || effectiveAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
          className="input w-auto"
        >
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>{a.accountType} — {a.accountNumber}</option>
          ))}
        </select>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reference or type..."
            className="input pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-surface-border">
              <tr>
                {['Type', 'Reference', 'Amount', 'Status', 'Date'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={5} className="text-center py-12">
                  <Loader2 className="w-6 h-6 text-brand-400 animate-spin mx-auto" />
                </td></tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-slate-500">No transactions found</td></tr>
              )}
              {filtered.map((tx) => {
                const isCredit = tx.type === 'DEPOSIT' || tx.type === 'TRANSFER_CREDIT'
                return (
                  <tr key={tx.id} className="border-b border-surface-border/50 hover:bg-surface-card/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={clsx('w-7 h-7 rounded-lg flex items-center justify-center',
                          isCredit ? 'bg-emerald-500/15' : 'bg-red-500/15')}>
                          {isCredit ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> :
                            tx.type === 'TRANSFER_DEBIT' ? <ArrowLeftRight className="w-3.5 h-3.5 text-orange-400" /> :
                              <TrendingDown className="w-3.5 h-3.5 text-red-400" />}
                        </div>
                        <span className="text-white text-sm">{tx.type.replace(/_/g, ' ')}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400 text-xs">{tx.reference}</td>
                    <td className="px-4 py-3">
                      <span className={isCredit ? 'amount-positive' : 'amount-negative'}>
                        {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx(
                        tx.status === 'COMPLETED' ? 'badge-success' :
                        tx.status === 'FAILED' ? 'badge-danger' : 'badge-warning'
                      )}>{tx.status}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-sm">
                      {format(new Date(tx.createdAt), 'dd MMM yyyy, HH:mm')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {txPage && txPage.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-surface-border">
            <span className="text-slate-500 text-sm">
              Page {txPage.pageNumber + 1} of {txPage.totalPages} ({txPage.totalElements} total)
            </span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => p - 1)} disabled={txPage.first} className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-30">Prev</button>
              <button onClick={() => setPage((p) => p + 1)} disabled={txPage.last} className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-30">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
