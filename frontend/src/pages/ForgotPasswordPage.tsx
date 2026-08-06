import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '@/api/authApi'

type Step = 'email' | 'otp' | 'reset' | 'done'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSendOtp = async () => {
    setLoading(true)
    try {
      await authApi.forgotPassword(email)
      toast.success('OTP sent to your email')
      setStep('otp')
    } catch { toast.error('Failed to send OTP') }
    finally { setLoading(false) }
  }

  const handleVerifyOtp = () => setStep('reset')

  const handleReset = async () => {
    setLoading(true)
    try {
      await authApi.resetPassword(email, otp, newPassword)
      toast.success('Password reset successfully!')
      setStep('done')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Reset failed')
    }
    finally { setLoading(false) }
  }

  const steps: Record<Step, React.ReactNode> = {
    email: (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Forgot Password?</h2>
        <p className="text-slate-400 text-sm">Enter your email and we'll send you a reset OTP.</p>
        <div>
          <label className="label">Email Address</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" />
        </div>
        <button onClick={handleSendOtp} disabled={loading || !email} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Send OTP
        </button>
      </div>
    ),
    otp: (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Enter OTP</h2>
        <p className="text-slate-400 text-sm">Check your email <span className="text-white">{email}</span></p>
        <div>
          <label className="label">OTP Code</label>
          <input
            type="text" value={otp} onChange={(e) => setOtp(e.target.value)}
            className="input text-center text-2xl tracking-[0.5em] font-mono" maxLength={6} placeholder="000000"
          />
        </div>
        <button onClick={handleVerifyOtp} disabled={otp.length !== 6} className="btn-primary w-full">Continue</button>
      </div>
    ),
    reset: (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Set New Password</h2>
        <div>
          <label className="label">New Password</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input" placeholder="••••••••" />
        </div>
        <button onClick={handleReset} disabled={loading || !newPassword} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Reset Password
        </button>
      </div>
    ),
    done: (
      <div className="text-center space-y-3">
        <div className="text-4xl">✅</div>
        <h2 className="text-xl font-bold text-white">Password Reset!</h2>
        <p className="text-slate-400">Redirecting to login...</p>
      </div>
    ),
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
      </div>
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-brand glow-brand mb-4">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">NexBank</h1>
        </div>
        <div className="card animate-fade-in">
          {steps[step]}
          <p className="text-center text-slate-400 text-sm mt-6">
            <Link to="/login" className="text-brand-400 hover:text-brand-300">← Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
