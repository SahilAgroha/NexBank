import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

interface InvoiceItem {
  id: number;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  userId: number;
  userEmail: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: InvoiceItem[];
}

interface InvoiceState {
  invoices: {
    content: Invoice[];
    totalPages: number;
    totalElements: number;
  };
  loading: boolean;
  error: string | null;
}

const initialState: InvoiceState = {
  invoices: {
    content: [],
    totalPages: 0,
    totalElements: 0,
  },
  loading: false,
  error: null,
};

export const fetchMyInvoices = createAsyncThunk('invoices/fetchMy', async (params: { page?: number; size?: number } = {}, { rejectWithValue }) => {
  try {
    const response = await api.get('/invoices', { params });
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch invoices');
  }
});

export const fetchAdminInvoices = createAsyncThunk('invoices/fetchAdmin', async (params: { page?: number; size?: number } = {}, { rejectWithValue }) => {
  try {
    const response = await api.get('/admin/invoices', { params });
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch invoices');
  }
});

export const emailInvoice = createAsyncThunk('invoices/email', async (id: number, { rejectWithValue }) => {
  try {
    await api.post(`/invoices/${id}/email`);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to email invoice');
  }
});

const invoiceSlice = createSlice({
  name: 'invoice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyInvoices.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload;
      })
      .addCase(fetchMyInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAdminInvoices.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload;
      })
      .addCase(fetchAdminInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default invoiceSlice.reducer;
