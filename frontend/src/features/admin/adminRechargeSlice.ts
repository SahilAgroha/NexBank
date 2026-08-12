import { createSlice, createAsyncThunk, createAction } from '@reduxjs/toolkit';
import api from '../../api/api';

interface RechargeRequest {
  id: number;
  partnerId: number;
  partnerEmail: string;
  amount: number;
  referenceNumber: string;
  status: string;
  adminRemarks: string;
  createdAt: string;
}

interface AdminRechargeState {
  requests: {
    content: RechargeRequest[];
    totalPages: number;
    totalElements: number;
  };
  loading: boolean;
  error: string | null;
  actionError: string | null;
}

const initialState: AdminRechargeState = {
  requests: {
    content: [],
    totalPages: 0,
    totalElements: 0,
  },
  loading: false,
  error: null,
  actionError: null,
};

export const clearActionError = createAction('adminRecharge/clearActionError');

export const fetchAdminRecharges = createAsyncThunk('adminRecharge/fetchAll', async (params: { page?: number; size?: number; status?: string } = {}, { rejectWithValue }) => {
  try {
    const response = await api.get('/admin/recharges', { params });
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch recharges');
  }
});

export const approveRecharge = createAsyncThunk('adminRecharge/approve', async (data: { id: number; remarks: string }, { rejectWithValue, dispatch }) => {
  try {
    const response = await api.post(`/admin/recharges/${data.id}/approve`, null, { params: { remarks: data.remarks } });
    dispatch(fetchAdminRecharges());
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to approve recharge');
  }
});

export const rejectRecharge = createAsyncThunk('adminRecharge/reject', async (data: { id: number; remarks: string }, { rejectWithValue, dispatch }) => {
  try {
    const response = await api.post(`/admin/recharges/${data.id}/reject`, null, { params: { remarks: data.remarks } });
    dispatch(fetchAdminRecharges());
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to reject recharge');
  }
});

const adminRechargeSlice = createSlice({
  name: 'adminRecharge',
  initialState,
  reducers: {
    clearActionError: (state) => {
      state.actionError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminRecharges.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminRecharges.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
      })
      .addCase(fetchAdminRecharges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(approveRecharge.pending, (state) => {
        state.actionError = null;
      })
      .addCase(approveRecharge.rejected, (state, action) => {
        state.actionError = action.payload as string;
      })
      .addCase(rejectRecharge.pending, (state) => {
        state.actionError = null;
      })
      .addCase(rejectRecharge.rejected, (state, action) => {
        state.actionError = action.payload as string;
      });
  },
});

export default adminRechargeSlice.reducer;
