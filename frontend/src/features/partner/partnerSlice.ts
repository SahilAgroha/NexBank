import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

export interface PartnerDashboardStats {
  totalCommission: number;
  totalCustomers: number;
  totalDownlinePartners: number;
  currentWalletBalance: number;
}

export interface CustomerInfo {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  registeredAt: string;
}

export interface HierarchyNode {
  id: number;
  fullName: string;
  email: string;
  partnerType: string;
  downline: HierarchyNode[];
}

interface PartnerState {
  dashboardStats: PartnerDashboardStats | null;
  customers: CustomerInfo[];
  hierarchy: HierarchyNode | null;
  loading: boolean;
  error: string | null;
}

const initialState: PartnerState = {
  dashboardStats: null,
  customers: [],
  hierarchy: null,
  loading: false,
  error: null,
};

export const fetchDashboardStats = createAsyncThunk(
  'partner/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/partner/dashboard');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  }
);

export const fetchCustomers = createAsyncThunk(
  'partner/fetchCustomers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/partner/customers');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customers');
    }
  }
);

export const fetchHierarchy = createAsyncThunk(
  'partner/fetchHierarchy',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/partner/hierarchy');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch hierarchy');
    }
  }
);

const partnerSlice = createSlice({
  name: 'partner',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchHierarchy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHierarchy.fulfilled, (state, action) => {
        state.loading = false;
        state.hierarchy = action.payload;
      })
      .addCase(fetchHierarchy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default partnerSlice.reducer;
