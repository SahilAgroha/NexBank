import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Shield, Users, AlertTriangle, SnowflakeIcon, Unlock, Loader2, CheckCircle } from 'lucide-react'
import { adminApi } from '@/api/clientApis'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import clsx from 'clsx'

type AdminTab = 'customers' | 'fraud'

interface AdminCustomer {
  id: string
  user: { id: string; firstName: string; lastName: string; email: string; role: string }
  kycStatus: string
  accounts?: Array<{ id: string; accountNumber: string; status: string; balance: number }>
}

interface FraudAlertItem {
  id: string
  accountId: string
  ruleTriggered: string
  description: string
  severity: string
  resolved: boolean
  createdAt: string
}

export default function AdminDashboardPage() {
  const [tab, setTab] = useState<AdminTab>('customers')
  const qc = useQueryClient()

  const { data: customersPage, isLoading: loadingCustomers } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: () => adminApi.getCustomers(0, 50).then((r) => r.data.data as { content: AdminCustomer[]; totalElements: number }),
  })

  const { data: fraudPage, isLoading: loadingFraud } = useQuery({
    queryKey: ['admin-fraud'],
    queryFn: () => adminApi.getFraudAlerts(0, 50).then((r) => r.data.data as { content: FraudAlertItem[]; totalElements: number }),
    enabled: tab === 'fraud',
  })

  const freezeMutation = useMutation({
    mutationFn: (accountId: string) => adminApi.freezeAccount(accountId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-customers'] }); toast.success('Account frozen') },
  })

  const unfreezeMutation = useMutation({
    mutationFn: (accountId: string) => adminApi.unfreezeAccount(accountId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-customers'] }); toast.success('Account unfrozen') },
  })

  const resolveAlertMutation = useMutation({
    mutationFn: (alertId: string) => adminApi.resolveAlert(alertId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-fraud'] }); toast.success('Alert resolved') },
  })

  const severityStyle: Record<string, string> = {
    LOW: 'badge-info', MEDIUM: 'badge-warning', HIGH: 'badge-danger', CRITICAL: 'badge-danger',
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-600/15 flex items-center justify-center">
          <Shield className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="text-slate-400 text-sm">{customersPage?.totalElements ?? 0} customers • {fraudPage?.totalElements ?? 0} fraud alerts</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-card rounded-xl border border-surface-border w-fit">
        {[
          { id: 'customers' as AdminTab, label: 'Customers', icon: Users },
          { id: 'fraud' as AdminTab, label: 'Fraud Alerts', icon: AlertTriangle },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              tab === id ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
            )}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Customers Tab */}
      {tab === 'customers' && (
        <div className="card overflow-hidden p-0">
          {loadingCustomers
            ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-brand-400 animate-spin" /></div>
            : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-surface-border">
                    <tr>
                      {['Customer', 'Email', 'KYC', 'Actions'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {customersPage?.content.map((c) => (
                      <tr key={c.id} className="border-b border-surface-border/50 hover:bg-surface-card/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-600/15 flex items-center justify-center text-brand-400 text-sm font-bold">
                              {c.user.firstName[0]}
                            </div>
                            <div>
                              <p className="text-white text-sm font-medium">{c.user.firstName} {c.user.lastName}</p>
                              <p className="text-slate-500 text-xs">{c.id.slice(0, 8)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-sm">{c.user.email}</td>
                        <td className="px-4 py-3">
                          <span className={clsx(
                            c.kycStatus === 'VERIFIED' ? 'badge-success' :
                            c.kycStatus === 'SUBMITTED' ? 'badge-info' :
                            c.kycStatus === 'REJECTED' ? 'badge-danger' : 'badge-warning'
                          )}>{c.kycStatus}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => adminApi.updateKyc(c.id, 'VERIFIED').then(() => { qc.invalidateQueries({ queryKey: ['admin-customers'] }); toast.success('KYC approved') })}
                              className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-xs"
                              title="Approve KYC"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      )}

      {/* Fraud Alerts Tab */}
      {tab === 'fraud' && (
        <div className="space-y-3">
          {loadingFraud && <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-brand-400 animate-spin" /></div>}
          {fraudPage?.content.length === 0 && (
            <div className="card text-center py-12">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <p className="text-slate-400">No unresolved fraud alerts</p>
            </div>
          )}
          {fraudPage?.content.map((alert) => (
            <div key={alert.id} className="card-hover">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-white font-semibold text-sm">{alert.ruleTriggered.replace(/_/g, ' ')}</p>
                      <span className={severityStyle[alert.severity]}>{alert.severity}</span>
                    </div>
                    <p className="text-slate-400 text-sm mt-0.5">{alert.description}</p>
                    <p className="text-slate-500 text-xs mt-1">Account: {alert.accountId.slice(0, 8)}... • {format(new Date(alert.createdAt), 'dd MMM yyyy, HH:mm')}</p>
                  </div>
                </div>
                <button
                  onClick={() => resolveAlertMutation.mutate(alert.id)}
                  disabled={resolveAlertMutation.isPending}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20 hover:bg-emerald-500/20 flex items-center gap-1"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Resolve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
