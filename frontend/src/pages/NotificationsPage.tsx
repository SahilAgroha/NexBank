import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCheck, Loader2 } from 'lucide-react'
import { notificationApi } from '@/api/clientApis'
import { useAuthStore } from '@/store/authStore'
import { format } from 'date-fns'
import clsx from 'clsx'
import type { NotificationType } from '@/types'

const typeColors: Record<NotificationType, string> = {
  TRANSACTION: 'bg-brand-500/15 text-brand-400',
  SECURITY: 'bg-red-500/15 text-red-400',
  KYC: 'bg-amber-500/15 text-amber-400',
  SYSTEM: 'bg-slate-500/15 text-slate-400',
  FRAUD_ALERT: 'bg-red-500/15 text-red-400',
}

export default function NotificationsPage() {
  const { user } = useAuthStore()
  const qc = useQueryClient()

  const { data: notifPage, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getAll(0, 50).then((r) => r.data.data),
    enabled: !!user,
  })

  const markAllMutation = useMutation({
    mutationFn: notificationApi.markAllRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const notifications = notifPage?.content ?? []
  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Notifications</h1>
          {unreadCount > 0 && <p className="text-slate-400 text-sm">{unreadCount} unread</p>}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {isLoading && <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-brand-400 animate-spin" /></div>}

      {notifications.length === 0 && !isLoading && (
        <div className="card text-center py-12">
          <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No notifications yet</p>
        </div>
      )}

      <div className="space-y-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={clsx(
              'card-hover flex gap-4 cursor-pointer',
              !n.read && 'border-brand-600/30 bg-brand-600/5'
            )}
            onClick={() => !n.read && notificationApi.markRead(n.id).then(() => qc.invalidateQueries({ queryKey: ['notifications'] }))}
          >
            <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', typeColors[n.type])}>
              <Bell className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className={clsx('text-sm font-semibold', n.read ? 'text-slate-300' : 'text-white')}>{n.title}</p>
                  <p className="text-slate-400 text-sm mt-0.5">{n.message}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-slate-500 text-xs">{format(new Date(n.createdAt), 'dd MMM, HH:mm')}</p>
                  {!n.read && <span className="w-2 h-2 bg-brand-500 rounded-full inline-block mt-1" />}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
