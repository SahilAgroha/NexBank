import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2, Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '@/api/authApi'
import { useAuthStore } from '@/store/authStore'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [needsVerification, setNeedsVerification] = useState(false)
  const [verifyEmail, setVerifyEmail] = useState('')
  const [otp, setOtp] = useState('')
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors, isSubmitting }, getValues } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authApi.login(data.email, data.password)
      const { user, accessToken, refreshToken } = res.data.data
      setAuth(user, accessToken, refreshToken)
      toast.success(`Welcome back, ${user.firstName}!`)
      navigate('/dashboard')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { errorCode?: string; message?: string } } }
      if (error.response?.data?.errorCode === 'EMAIL_NOT_VERIFIED') {
        setNeedsVerification(true)
        setVerifyEmail(data.email)
        toast.error('Please verify your email first')
      } else {
        toast.error(error.response?.data?.message || 'Login failed')
      }
    }
  }

  const handleVerify = async () => {
    try {
      await authApi.verifyEmail(verifyEmail, otp)
      toast.success('Email verified! You can now log in.')
      setNeedsVerification(false)
      handleSubmit(onSubmit)()
    } catch {
      toast.error('Invalid or expired OTP')
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-brand glow-brand mb-4">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">NexBank</h1>
          <p className="text-slate-400 mt-1">Modern Digital Banking</p>
        </div>

        <div className="card animate-fade-in">
          {!needsVerification ? (
            <>
              <h2 className="text-xl font-bold text-white mb-6">Sign in to your account</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="label">Email Address</label>
                  <input {...register('email')} type="email" className="input" placeholder="you@example.com" />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      className="input pr-11"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
                </div>
                <div className="flex justify-end">
                  <Link to="/forgot-password" className="text-xs text-brand-400 hover:text-brand-300">
                    Forgot password?
                  </Link>
                </div>
                <button type="submit" disabled={isSubmitting} className="btn-primary w-full flex items-center justify-center gap-2">
                  {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign In'}
                </button>
              </form>
              <p className="text-center text-slate-400 text-sm mt-6">
                Don't have an account?{' '}
                <Link to="/register" className="text-brand-400 hover:text-brand-300 font-semibold">Create one</Link>
              </p>
            </>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Verify Your Email</h2>
              <p className="text-slate-400 text-sm">We sent a 6-digit OTP to <span className="text-white">{verifyEmail}</span></p>
              <div>
                <label className="label">OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="input text-center text-2xl tracking-[0.5em] font-mono"
                  maxLength={6}
                  placeholder="000000"
                />
              </div>
              <button onClick={handleVerify} className="btn-primary w-full">Verify & Login</button>
              <button
                onClick={() => authApi.resendOtp(verifyEmail).then(() => toast.success('OTP resent!'))}
                className="btn-secondary w-full"
              >
                Resend OTP
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
