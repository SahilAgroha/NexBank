import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Wallet, QrCode, Smartphone, CreditCard, Loader2 } from 'lucide-react'
import { accountApi } from '@/api/accountApi'
import { paymentApi } from '@/api/clientApis'
import toast from 'react-hot-toast'
import QRCode from 'react-qr-code'
import clsx from 'clsx'

type PayTab = 'upi' | 'qr' | 'razorpay'

export default function PaymentsPage() {
  const [tab, setTab] = useState<PayTab>('upi')
  const [upiId, setUpiId] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [selectedAccountId, setSelectedAccountId] = useState('')
  const [qrPayData, setQrPayData] = useState('')
  const [qrAmount, setQrAmount] = useState('')
  const [myQrValue] = useState(() => `upi://pay?pa=nexbank@upi&pn=NexBank&am=&cu=INR`)

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountApi.getAll().then((r) => r.data.data),
  })

  // Derive first active account id
  const effectiveAccountId = selectedAccountId || accounts.find((a) => a.status === 'ACTIVE')?.id || ''

  const upiMutation = useMutation({
    mutationFn: () => paymentApi.upi(effectiveAccountId, upiId, parseFloat(amount), description),
    onSuccess: () => toast.success('UPI payment successful!'),
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Payment failed')
    },
  })

  const qrMutation = useMutation({
    mutationFn: () => paymentApi.qr(effectiveAccountId, qrPayData, parseFloat(qrAmount)),
    onSuccess: () => toast.success('QR payment successful!'),
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'QR payment failed')
    },
  })

  const tabs = [
    { id: 'upi' as PayTab, label: 'UPI Transfer', icon: Smartphone },
    { id: 'qr' as PayTab, label: 'QR Pay', icon: QrCode },
    { id: 'razorpay' as PayTab, label: 'Card / UPI', icon: CreditCard },
  ]

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
      <h1 className="page-title">Payments</h1>

      {/* Account Selector */}
      <div>
        <label className="label">Pay From</label>
        <select
          value={effectiveAccountId}
          onChange={(e) => setSelectedAccountId(e.target.value)}
          className="input"
        >
          {accounts.filter((a) => a.status === 'ACTIVE').map((a) => (
            <option key={a.id} value={a.id}>{a.accountType} — {a.accountNumber} (₹{a.balance.toFixed(2)})</option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-card rounded-xl border border-surface-border">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all',
              tab === id
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/30'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* UPI Tab */}
      {tab === 'upi' && (
        <div className="card space-y-4">
          <h2 className="section-title flex items-center gap-2"><Smartphone className="w-5 h-5 text-brand-400" /> UPI Transfer</h2>
          <div>
            <label className="label">UPI ID</label>
            <input value={upiId} onChange={(e) => setUpiId(e.target.value)} className="input" placeholder="name@upi" />
          </div>
          <div>
            <label className="label">Amount (₹)</label>
            <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" className="input" placeholder="0.00" />
          </div>
          <div>
            <label className="label">Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} className="input" placeholder="Payment description" />
          </div>
          <button
            onClick={() => upiMutation.mutate()}
            disabled={upiMutation.isPending || !upiId || !amount}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {upiMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
            Pay ₹{amount || '0'}
          </button>
        </div>
      )}

      {/* QR Tab */}
      {tab === 'qr' && (
        <div className="card space-y-4">
          <h2 className="section-title flex items-center gap-2"><QrCode className="w-5 h-5 text-brand-400" /> QR Payment</h2>
          <div className="text-center p-4 bg-white rounded-2xl mx-auto w-fit">
            <QRCode value={myQrValue} size={160} />
            <p className="text-slate-600 text-xs mt-2">Scan to pay NexBank</p>
          </div>
          <div className="border-t border-surface-border pt-4">
            <p className="text-slate-400 text-sm mb-3">Or pay using QR data</p>
            <div className="space-y-3">
              <div>
                <label className="label">QR Data / URL</label>
                <input value={qrPayData} onChange={(e) => setQrPayData(e.target.value)} className="input" placeholder="upi://pay?pa=..." />
              </div>
              <div>
                <label className="label">Amount (₹)</label>
                <input value={qrAmount} onChange={(e) => setQrAmount(e.target.value)} type="number" className="input" placeholder="0.00" />
              </div>
              <button
                onClick={() => qrMutation.mutate()}
                disabled={qrMutation.isPending || !qrPayData || !qrAmount}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {qrMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Pay via QR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Razorpay Tab */}
      {tab === 'razorpay' && (
        <div className="card space-y-4">
          <h2 className="section-title flex items-center gap-2"><CreditCard className="w-5 h-5 text-brand-400" /> Pay via Razorpay</h2>
          <p className="text-slate-400 text-sm">Pay using UPI, Debit Card, Credit Card, or Net Banking via Razorpay's secure gateway.</p>
          <div>
            <label className="label">Amount (₹)</label>
            <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" className="input" placeholder="0.00" />
          </div>
          <div>
            <label className="label">Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} className="input" placeholder="Payment for..." />
          </div>
          <button
            onClick={async () => {
              try {
                const res = await paymentApi.createRazorpayOrder(effectiveAccountId, parseFloat(amount), description)
                const orderId = res.data.data.razorpayOrderId
                const options = {
                  key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                  amount: parseFloat(amount) * 100,
                  currency: 'INR',
                  name: 'NexBank',
                  description,
                  order_id: orderId,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  handler: async (response: any) => {
                    await paymentApi.verifyRazorpay(
                      response.razorpay_order_id,
                      response.razorpay_payment_id,
                      response.razorpay_signature
                    )
                    toast.success('Payment successful!')
                  },
                  theme: { color: '#4f46e5' },
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const rzp = new (window as any).Razorpay(options)
                rzp.open()
              } catch {
                toast.error('Failed to initiate payment')
              }
            }}
            disabled={!amount}
            className="btn-primary w-full"
          >
            Pay ₹{amount || '0'} via Razorpay
          </button>
          <p className="text-slate-500 text-xs text-center">🔒 Secured by Razorpay</p>
        </div>
      )}
    </div>
  )
}
