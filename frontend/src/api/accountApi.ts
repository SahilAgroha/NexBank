import { api } from './axiosClient'
import type { ApiResponse, Account, PageResponse, Transaction } from '@/types'

export const accountApi = {
  create: (accountType: 'SAVINGS' | 'CURRENT') =>
    api.post<ApiResponse<Account>>('/accounts', { accountType }),

  getAll: () =>
    api.get<ApiResponse<Account[]>>('/accounts'),

  getById: (id: string) =>
    api.get<ApiResponse<Account>>(`/accounts/${id}`),

  freeze: (id: string) =>
    api.patch<ApiResponse<Account>>(`/accounts/${id}/freeze`),
}

export const transactionApi = {
  deposit: (data: { accountId: string; amount: number; description?: string; idempotencyKey?: string }) =>
    api.post<ApiResponse<Transaction>>('/transactions/deposit', data),

  withdraw: (data: { accountId: string; amount: number; description?: string; idempotencyKey?: string }) =>
    api.post<ApiResponse<Transaction>>('/transactions/withdraw', data),

  transfer: (data: {
    fromAccountId: string; toAccountNumber: string; amount: number;
    description?: string; idempotencyKey?: string; beneficiaryId?: string
  }) => api.post<ApiResponse<Transaction>>('/transactions/transfer', data),

  getHistory: (accountId: string, page = 0, size = 20) =>
    api.get<ApiResponse<PageResponse<Transaction>>>(`/transactions/account/${accountId}?page=${page}&size=${size}`),
}
