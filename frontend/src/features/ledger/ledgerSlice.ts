import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export interface LedgerEntry {
    id: number;
    referenceNumber: string;
    type: 'CREDIT' | 'DEBIT';
    amount: number;
    openingBalance: number;
    closingBalance: number;
    description: string;
    createdAt: string;
    userEmail?: string;
    walletId?: number;
}

export interface LedgerState {
    entries: LedgerEntry[];
    totalPages: number;
    totalElements: number;
    loading: boolean;
    error: string | null;
}

const initialState: LedgerState = {
    entries: [],
    totalPages: 0,
    totalElements: 0,
    loading: false,
    error: null,
};

interface FetchLedgerParams {
    page?: number;
    size?: number;
    startDate?: string;
    endDate?: string;
    type?: string;
}

export const fetchMyLedger = createAsyncThunk(
    'ledger/fetchMyLedger',
    async (params: FetchLedgerParams, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/ledger', {
                params,
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.data; // Page<LedgerEntryDTO>
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch ledger');
        }
    }
);

export const fetchSystemLedger = createAsyncThunk(
    'ledger/fetchSystemLedger',
    async (params: FetchLedgerParams, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/admin/ledger', {
                params,
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.data; // Page<LedgerEntryDTO>
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch system ledger');
        }
    }
);

export const downloadLedgerCsv = async (isAdmin: boolean, params: FetchLedgerParams) => {
    const token = localStorage.getItem('token');
    const url = isAdmin ? 'http://localhost:8080/api/admin/ledger/export' : 'http://localhost:8080/api/ledger/export';
    
    const queryString = new URLSearchParams(params as any).toString();
    
    const response = await fetch(`${url}?${queryString}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!response.ok) {
        throw new Error('Failed to download CSV');
    }
    
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = isAdmin ? 'system_ledger.csv' : 'my_ledger.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
};

const ledgerSlice = createSlice({
    name: 'ledger',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch My Ledger
            .addCase(fetchMyLedger.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyLedger.fulfilled, (state, action) => {
                state.loading = false;
                state.entries = action.payload.content;
                state.totalPages = action.payload.totalPages;
                state.totalElements = action.payload.totalElements;
            })
            .addCase(fetchMyLedger.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch System Ledger
            .addCase(fetchSystemLedger.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSystemLedger.fulfilled, (state, action) => {
                state.loading = false;
                state.entries = action.payload.content;
                state.totalPages = action.payload.totalPages;
                state.totalElements = action.payload.totalElements;
            })
            .addCase(fetchSystemLedger.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
});

export default ledgerSlice.reducer;
