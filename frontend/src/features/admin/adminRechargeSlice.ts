import {
  createSlice,
  createAsyncThunk,
} from '@reduxjs/toolkit';
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

type RechargeParams = {
  page?: number;
  size?: number;
  status?: string;
};

/* =========================
   FETCH ADMIN RECHARGES
========================= */

export const fetchAdminRecharges = createAsyncThunk<
  any,
  RechargeParams | undefined,
  { rejectValue: string }
>(
  'adminRecharge/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get(
        '/admin/recharges',
        {
          params,
        }
      );

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to fetch recharges'
      );
    }
  }
);

/* =========================
   APPROVE RECHARGE
========================= */

export const approveRecharge = createAsyncThunk<
  any,
  {
    id: number;
    remarks: string;
  },
  { rejectValue: string }
>(
  'adminRecharge/approve',
  async (
    data,
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await api.post(
        `/admin/recharges/${data.id}/approve`,
        null,
        {
          params: {
            remarks: data.remarks,
          },
        }
      );

      dispatch(fetchAdminRecharges());

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to approve recharge'
      );
    }
  }
);

/* =========================
   REJECT RECHARGE
========================= */

export const rejectRecharge = createAsyncThunk<
  any,
  {
    id: number;
    remarks: string;
  },
  { rejectValue: string }
>(
  'adminRecharge/reject',
  async (
    data,
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await api.post(
        `/admin/recharges/${data.id}/reject`,
        null,
        {
          params: {
            remarks: data.remarks,
          },
        }
      );

      dispatch(fetchAdminRecharges());

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to reject recharge'
      );
    }
  }
);

/* =========================
   SLICE
========================= */

const adminRechargeSlice = createSlice({
  name: 'adminRecharge',
  initialState,

  reducers: {
    clearActionError: (state) => {
      state.actionError = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* Fetch */
      .addCase(
        fetchAdminRecharges.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchAdminRecharges.fulfilled,
        (state, action) => {
          state.loading = false;
          state.requests = action.payload;
        }
      )

      .addCase(
        fetchAdminRecharges.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            'Failed to fetch recharges';
        }
      )

      /* Approve */
      .addCase(
        approveRecharge.pending,
        (state) => {
          state.actionError = null;
        }
      )

      .addCase(
        approveRecharge.fulfilled,
        (state) => {
          state.actionError = null;
        }
      )

      .addCase(
        approveRecharge.rejected,
        (state, action) => {
          state.actionError =
            action.payload ||
            'Failed to approve recharge';
        }
      )

      /* Reject */
      .addCase(
        rejectRecharge.pending,
        (state) => {
          state.actionError = null;
        }
      )

      .addCase(
        rejectRecharge.fulfilled,
        (state) => {
          state.actionError = null;
        }
      )

      .addCase(
        rejectRecharge.rejected,
        (state, action) => {
          state.actionError =
            action.payload ||
            'Failed to reject recharge';
        }
      );
  },
});

export const {
  clearActionError,
} = adminRechargeSlice.actions;

export default adminRechargeSlice.reducer;