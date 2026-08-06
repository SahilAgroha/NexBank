import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '@/api/authApi'

const schema = z.object({
  firstName: z.string().min(2, 'Min 2 characters'),
  lastName: z.string().min(2, 'Min 2 characters'),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit Indian mobile number'),
  password: z
    .string()
    .min(8, 'Min 8 characters')
    .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, 'Must include uppercase, lowercase, digit and special char'),
})
type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState<'form' | 'verify'>('form')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      await authApi.register(data)
      setEmail(data.email)
      setStep('verify')
      toast.success('Account created! Please verify your email.')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Registration failed')
    }
  }

  const handleVerify = async () => {
    try {
      await authApi.verifyEmail(email, otp)
      toast.success('Email verified! Redirecting to login...')
      setTimeout(() => navigate('/login'), 1500)
    } catch {
      toast.error('Invalid or expired OTP')
    }
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
          <p className="text-slate-400 mt-1">Create your account</p>
        </div>

        <div className="card animate-fade-in">
          {step === 'form' ? (
            <>
              <h2 className="text-xl font-bold text-white mb-6">Get started today</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">First Name</label>
                    <input {...register('firstName')} className="input" placeholder="John" />
                    {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName.message}</p>}
                  </div>
                  <div>
                    <label className="label">Last Name</label>
                    <input {...register('lastName')} className="input" placeholder="Doe" />
                    {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="label">Email Address</label>
                  <input {...register('email')} type="email" className="input" placeholder="you@example.com" />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="label">Mobile Number</label>
                  <input {...register('phone')} type="tel" className="input" placeholder="9876543210" />
                  {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
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
                <button type="submit" disabled={isSubmitting} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
                  {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : 'Create Account'}
                </button>
              </form>
              <p className="text-center text-slate-400 text-sm mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold">Sign in</Link>
              </p>
            </>
          ) : (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Check your email</h2>
              <p className="text-slate-400 text-sm">
                We sent a 6-digit OTP to <span className="text-white">{email}</span>
              </p>
              <div className="text-left">
                <label className="label">OTP Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="input text-center text-2xl tracking-[0.5em] font-mono"
                  maxLength={6}
                  placeholder="000000"
                />
              </div>
              <button onClick={handleVerify} className="btn-primary w-full">Verify Email</button>
              <button
                onClick={() => authApi.resendOtp(email).then(() => toast.success('OTP resent!'))}
                className="text-brand-400 hover:text-brand-300 text-sm"
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
