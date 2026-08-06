import { api } from './axiosClient'
import type { ApiResponse, AuthResponse } from '@/types'

export const authApi = {
  register: (data: {
    firstName: string; lastName: string; email: string; password: string; phone: string
  }) => api.post<ApiResponse<null>>('/auth/register', data),

  verifyEmail: (email: string, otp: string) =>
    api.post<ApiResponse<null>>('/auth/verify-email', { email, otp }),

  resendOtp: (email: string) =>
    api.post<ApiResponse<null>>(`/auth/resend-otp?email=${encodeURIComponent(email)}`),

  login: (email: string, password: string) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password }),

  refresh: (refreshToken: string) =>
    api.post<ApiResponse<AuthResponse>>('/auth/refresh', { refreshToken }),

  forgotPassword: (email: string) =>
    api.post<ApiResponse<null>>('/auth/forgot-password', { email }),

  resetPassword: (email: string, otp: string, newPassword: string) =>
    api.post<ApiResponse<null>>('/auth/reset-password', { email, otp, newPassword }),

  logout: (refreshToken: string) =>
    api.post<ApiResponse<null>>('/auth/logout', { refreshToken }),
}
