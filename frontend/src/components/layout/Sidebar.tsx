import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, CreditCard, ArrowLeftRight, Send, Users,
  Wallet, Bell, UserCircle, ShieldAlert, LogOut, Building2
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/api/authApi'
import clsx from 'clsx'

const customerNav = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/accounts',      icon: CreditCard,       label: 'Accounts' },
  { to: '/transactions',  icon: ArrowLeftRight,   label: 'Transactions' },
  { to: '/transfer',      icon: Send,             label: 'Transfer' },
  { to: '/beneficiaries', icon: Users,            label: 'Beneficiaries' },
  { to: '/payments',      icon: Wallet,           label: 'Payments' },
  { to: '/notifications', icon: Bell,             label: 'Notifications' },
  { to: '/profile',       icon: UserCircle,       label: 'Profile' },
]

const adminNav = [
  { to: '/admin', icon: ShieldAlert, label: 'Admin Panel' },
]

export default function Sidebar() {
  const { user, logout, refreshToken } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      if (refreshToken) await authApi.logout(refreshToken)
    } finally {
      logout()
      navigate('/login')
    }
  }

  const navItems = user?.role === 'ADMIN' ? adminNav : customerNav

  return (
    <aside className="w-64 flex-shrink-0 bg-surface-card border-r border-surface-border flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-surface-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center glow-brand">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-white tracking-tight">NexBank</p>
            <p className="text-xs text-slate-500">Digital Banking</p>
          </div>
        </div>
      </div>

      {/* User card */}
      <div className="px-4 py-3 border-b border-surface-border">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-surface/50">
          <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white text-sm font-bold">
            {user?.firstName[0]}{user?.lastName[0]}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-slate-500">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx('nav-item', isActive && 'active')
            }
          >
            <Icon className="w-4.5 h-4.5" />
            <span className="text-sm">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-surface-border">
        <button
          onClick={handleLogout}
          className="nav-item w-full text-red-400 hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="w-4.5 h-4.5" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </aside>
  )
}
