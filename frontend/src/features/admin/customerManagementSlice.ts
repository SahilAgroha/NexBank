import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Interfaces
export interface GlobalMargin {
    id: number;
    serviceProduct: any;
    marginType: string;
    amount: number;
}

export interface SystemBankAccount {
    id: number;
    accountName: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    active: boolean;
}

export interface MerchantBankAccount {
    id: number;
    merchantId: number;
    merchantName: string;
    institution: string;
    accountMetadata: string;
    ifscAndContact: string;
    status: string;
    createdAt: string;
}

export interface CustomerManagementState {
    margins: GlobalMargin[];
    systemBankAccounts: SystemBankAccount[];
    settlementAccounts: MerchantBankAccount[];
    loading: boolean;
    error: string | null;
}

const initialState: CustomerManagementState = {
    margins: [],
    systemBankAccounts: [],
    settlementAccounts: [],
    loading: false,
    error: null,
};

// Thunks
export const fetchGlobalMargins = createAsyncThunk('customerManagement/fetchMargins', async (_, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8080/api/admin/margins', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch margins');
    }
});

export const updateGlobalMargin = createAsyncThunk('customerManagement/updateMargin', async (data: { serviceProductId: number, marginType: string, amount: number }, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.put('http://localhost:8080/api/admin/margins', data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || 'Failed to update margin');
    }
});

export const fetchSystemBankAccounts = createAsyncThunk('customerManagement/fetchSystemBankAccounts', async (_, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8080/api/admin/bank-accounts', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch bank accounts');
    }
});

export const createSystemBankAccount = createAsyncThunk('customerManagement/createSystemBankAccount', async (data: Omit<SystemBankAccount, 'id' | 'active'>, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post('http://localhost:8080/api/admin/bank-accounts', data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || 'Failed to create bank account');
    }
});

export const toggleSystemBankAccount = createAsyncThunk('customerManagement/toggleSystemBankAccount', async (id: number, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.patch(`http://localhost:8080/api/admin/bank-accounts/${id}/toggle`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || 'Failed to toggle bank account');
    }
});

export const deleteSystemBankAccount = createAsyncThunk('customerManagement/deleteSystemBankAccount', async (id: number, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:8080/api/admin/bank-accounts/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return id;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || 'Failed to delete bank account');
    }
});

export const fetchSettlementAccounts = createAsyncThunk('customerManagement/fetchSettlementAccounts', async (_, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8080/api/admin/settlement-accounts', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch settlement accounts');
    }
});

export const updateSettlementAccountStatus = createAsyncThunk('customerManagement/updateSettlementAccountStatus', async (data: { id: number, status: string }, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.patch(`http://localhost:8080/api/admin/settlement-accounts/${data.id}/status?status=${data.status}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || 'Failed to update settlement account status');
    }
});

const customerManagementSlice = createSlice({
    name: 'customerManagement',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchGlobalMargins.pending, (state) => { state.loading = true; })
               .addCase(fetchGlobalMargins.fulfilled, (state, action) => { state.loading = false; state.margins = action.payload; })
               .addCase(fetchGlobalMargins.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

        builder.addCase(updateGlobalMargin.fulfilled, (state, action) => {
            const index = state.margins.findIndex(m => m.id === action.payload.id);
            if (index >= 0) state.margins[index] = action.payload;
            else state.margins.push(action.payload);
        });

        builder.addCase(fetchSystemBankAccounts.pending, (state) => { state.loading = true; })
               .addCase(fetchSystemBankAccounts.fulfilled, (state, action) => { state.loading = false; state.systemBankAccounts = action.payload; })
               .addCase(fetchSystemBankAccounts.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

        builder.addCase(createSystemBankAccount.fulfilled, (state, action) => { state.systemBankAccounts.push(action.payload); });
        
        builder.addCase(toggleSystemBankAccount.fulfilled, (state, action) => {
            const index = state.systemBankAccounts.findIndex(b => b.id === action.payload.id);
            if (index >= 0) state.systemBankAccounts[index] = action.payload;
        });

        builder.addCase(deleteSystemBankAccount.fulfilled, (state, action) => {
            state.systemBankAccounts = state.systemBankAccounts.filter(b => b.id !== action.payload);
        });

        builder.addCase(fetchSettlementAccounts.pending, (state) => { state.loading = true; })
               .addCase(fetchSettlementAccounts.fulfilled, (state, action) => { state.loading = false; state.settlementAccounts = action.payload; })
               .addCase(fetchSettlementAccounts.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

        builder.addCase(updateSettlementAccountStatus.fulfilled, (state, action) => {
            const index = state.settlementAccounts.findIndex(a => a.id === action.payload.id);
            if (index >= 0) state.settlementAccounts[index] = action.payload;
        });
    }
});

export default customerManagementSlice.reducer;
