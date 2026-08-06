// ─── Auth ─────────────────────────────────────────────────────
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  phone: string
}

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'ADMIN' | 'CUSTOMER'
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  user: AuthUser
}

// ─── Account ──────────────────────────────────────────────────
export type AccountType = 'SAVINGS' | 'CURRENT'
export type AccountStatus = 'ACTIVE' | 'FROZEN' | 'CLOSED'

export interface Account {
  id: string
  accountNumber: string
  accountType: AccountType
  status: AccountStatus
  balance: number
  ifscCode: string
  branch: string
  createdAt: string
}

// ─── Transaction ──────────────────────────────────────────────
export type TransactionType =
  | 'DEPOSIT' | 'WITHDRAWAL'
  | 'TRANSFER_DEBIT' | 'TRANSFER_CREDIT'
  | 'PAYMENT_DEBIT' | 'PAYMENT_CREDIT'
  | 'REVERSAL'

export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED'

export interface Transaction {
  id: string
  reference: string
  fromAccountId: string | null
  toAccountId: string | null
  type: TransactionType
  amount: number
  status: TransactionStatus
  description: string | null
  createdAt: string
}

// ─── Beneficiary ──────────────────────────────────────────────
export interface Beneficiary {
  id: string
  name: string
  accountNumber: string
  ifscCode: string | null
  bankName: string | null
  verified: boolean
}

// ─── Payment ──────────────────────────────────────────────────
export type PaymentType = 'QR' | 'UPI' | 'MERCHANT' | 'RAZORPAY'

export interface Payment {
  id: string
  fromAccountId: string
  paymentType: PaymentType
  amount: number
  status: TransactionStatus
  reference: string
  upiId: string | null
  qrData: string | null
  razorpayOrderId: string | null
  razorpayPaymentId: string | null
  description: string | null
  createdAt: string
}

// ─── Customer ─────────────────────────────────────────────────
export type KycStatus = 'PENDING' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED'

export interface CustomerProfile {
  id: string
  userId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string | null
  gender: string | null
  panNumber: string | null
  aadharNumber: string | null
  occupation: string | null
  kycStatus: KycStatus
  address: Address | null
  nominee: Nominee | null
}

export interface Address {
  line1: string
  line2: string | null
  city: string
  state: string
  pincode: string
  country: string
}

export interface Nominee {
  name: string
  relation: string
  dateOfBirth: string | null
  phone: string | null
}

// ─── Notification ─────────────────────────────────────────────
export type NotificationType = 'TRANSACTION' | 'SECURITY' | 'KYC' | 'SYSTEM' | 'FRAUD_ALERT'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: string
}

// ─── Fraud ────────────────────────────────────────────────────
export type FraudSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface FraudAlert {
  id: string
  accountId: string
  transactionId: string | null
  ruleTriggered: string
  description: string
  severity: FraudSeverity
  resolved: boolean
  createdAt: string
}

// ─── API ──────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean
  message: string
  errorCode: string | null
  data: T
  validationErrors: Record<string, string> | null
  timestamp: string
}

export interface PageResponse<T> {
  content: T[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
  first: boolean
}
