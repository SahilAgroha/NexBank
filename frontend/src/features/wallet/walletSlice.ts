import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

interface Transaction {
  referenceNumber: string;
  amount: number;
  type: string;
  status: string;
  description: string;
  createdAt: string;
  senderName: string;
  receiverName: string;
}

interface RechargeRequest {
  id: number;
  amount: number;
  referenceNumber: string;
  status: string;
  adminRemarks: string;
  createdAt: string;
}

interface WalletState {
  balance: number;
  transactions: Transaction[];
  rechargeRequests: {
    content: RechargeRequest[];
    totalPages: number;
    totalElements: number;
  };
  loading: boolean;
  error: string | null;
}

const initialState: WalletState = {
  balance: 0,
  transactions: [],
  rechargeRequests: {
    content: [],
    totalPages: 0,
    totalElements: 0,
  },
  loading: false,
  error: null,
};

export const fetchWalletBalance = createAsyncThunk('wallet/fetchBalance', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/wallets/me/balance');
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch balance');
  }
});

export const fetchTransactions = createAsyncThunk('wallet/fetchTransactions', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/wallets/me/transactions');
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
  }
});

export const transferFunds = createAsyncThunk('wallet/transfer', async (data: { receiverIdentifier: string; amount: number; description?: string }, { rejectWithValue, dispatch }) => {
  try {
    const response = await api.post('/wallets/transfer', data);
    dispatch(fetchWalletBalance());
    dispatch(fetchTransactions());
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Transfer failed');
  }
});

export const submitPartnerRecharge = createAsyncThunk('wallet/submitPartnerRecharge', async (data: { amount: number; referenceNumber: string }, { rejectWithValue, dispatch }) => {
  try {
    const response = await api.post('/partner/recharges', data);
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Recharge request failed');
  }
});

export const fetchPartnerRecharges = createAsyncThunk('wallet/fetchPartnerRecharges', async (params: { page?: number; size?: number } = {}, { rejectWithValue }) => {
  try {
    const response = await api.get('/partner/recharges', { params });
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch recharge history');
  }
});

export const partnerTransferFunds = createAsyncThunk('wallet/partnerTransfer', async (data: { receiverEmail: string; amount: number; description?: string }, { rejectWithValue, dispatch }) => {
  try {
    const response = await api.post('/partner/transfer', data);
    dispatch(fetchWalletBalance());
    dispatch(fetchTransactions());
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Transfer failed');
  }
});

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWalletBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWalletBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload;
      })
      .addCase(fetchWalletBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload;
      })
      .addCase(fetchPartnerRecharges.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPartnerRecharges.fulfilled, (state, action) => {
        state.loading = false;
        state.rechargeRequests = action.payload;
      });
  },
});

export default walletSlice.reducer;
