import { api } from './axiosClient'
import type { ApiResponse, Beneficiary, CustomerProfile, Notification, PageResponse, Payment } from '@/types'

export const beneficiaryApi = {
  add: (data: { name: string; accountNumber: string; ifscCode?: string; bankName?: string }) =>
    api.post<ApiResponse<Beneficiary>>('/beneficiaries', data),

  verify: (id: string, otp: string) =>
    api.post<ApiResponse<Beneficiary>>(`/beneficiaries/${id}/verify?otp=${otp}`),

  getAll: () =>
    api.get<ApiResponse<Beneficiary[]>>('/beneficiaries'),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/beneficiaries/${id}`),
}

export const paymentApi = {
  upi: (fromAccountId: string, upiId: string, amount: number, description?: string) =>
    api.post<ApiResponse<Payment>>(
      `/payments/upi?fromAccountId=${fromAccountId}&upiId=${upiId}&amount=${amount}&description=${description || ''}`
    ),

  qr: (fromAccountId: string, qrData: string, amount: number) =>
    api.post<ApiResponse<Payment>>(
      `/payments/qr?fromAccountId=${fromAccountId}&qrData=${encodeURIComponent(qrData)}&amount=${amount}`
    ),

  createRazorpayOrder: (fromAccountId: string, amount: number, description?: string) =>
    api.post<ApiResponse<Payment>>(
      `/payments/razorpay/order?fromAccountId=${fromAccountId}&amount=${amount}&description=${description || ''}`
    ),

  verifyRazorpay: (orderId: string, paymentId: string, signature: string) =>
    api.post<ApiResponse<Payment>>(
      `/payments/razorpay/verify?razorpayOrderId=${orderId}&razorpayPaymentId=${paymentId}&razorpaySignature=${signature}`
    ),

  getHistory: (accountId: string, page = 0, size = 20) =>
    api.get<ApiResponse<PageResponse<Payment>>>(`/payments/account/${accountId}?page=${page}&size=${size}`),
}

export const customerApi = {
  getProfile: () =>
    api.get<ApiResponse<CustomerProfile>>('/customers/me'),

  updateProfile: (data: object) =>
    api.put<ApiResponse<CustomerProfile>>('/customers/me', data),

  updateAddress: (data: object) =>
    api.put<ApiResponse<CustomerProfile>>('/customers/me/address', data),

  updateNominee: (data: object) =>
    api.put<ApiResponse<CustomerProfile>>('/customers/me/nominee', data),

  uploadKyc: (documentType: string, file: File) => {
    const form = new FormData()
    form.append('documentType', documentType)
    form.append('file', file)
    return api.post<ApiResponse<string>>('/customers/me/kyc', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export const notificationApi = {
  getAll: (page = 0, size = 20) =>
    api.get<ApiResponse<PageResponse<Notification>>>(`/notifications?page=${page}&size=${size}`),

  getUnreadCount: () =>
    api.get<ApiResponse<number>>('/notifications/unread-count'),

  markAllRead: () =>
    api.post<ApiResponse<null>>('/notifications/mark-all-read'),

  markRead: (id: string) =>
    api.patch<ApiResponse<null>>(`/notifications/${id}/read`),
}

export const adminApi = {
  getCustomers: (page = 0, size = 20) =>
    api.get<ApiResponse<PageResponse<object>>>(`/admin/customers?page=${page}&size=${size}`),

  freezeAccount: (accountId: string, reason?: string) =>
    api.patch<ApiResponse<object>>(`/admin/accounts/${accountId}/freeze?reason=${reason || 'Admin action'}`),

  unfreezeAccount: (accountId: string) =>
    api.patch<ApiResponse<object>>(`/admin/accounts/${accountId}/unfreeze`),

  updateKyc: (customerId: string, status: string, reason?: string) =>
    api.patch<ApiResponse<object>>(
      `/admin/customers/${customerId}/kyc?status=${status}&reason=${reason || ''}`
    ),

  getFraudAlerts: (page = 0, size = 20) =>
    api.get<ApiResponse<PageResponse<object>>>(`/admin/fraud-alerts?page=${page}&size=${size}`),

  resolveAlert: (alertId: string) =>
    api.patch<ApiResponse<null>>(`/admin/fraud-alerts/${alertId}/resolve`),
}
