import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export interface DailyTransactionCount {
    date: string;
    count: number;
}

export interface TopProductData {
    name: string;
    count: number;
}

export interface TransactionStatusMetric {
    status: string;
    count: number;
    amount: number;
}

export interface AdminDashboardStats {
    totalUsers: number;
    totalPartners: number;
    systemBalance: number;
    dailyTransactions: number;
    chartData: DailyTransactionCount[];
    totalPurchased: number;
    totalCustomerWalletBalance: number;
    commissionIn: number;
    commissionOut: number;
    netProfit: number;
    transactionStats: TransactionStatusMetric[];
    topProducts: TopProductData[];
}

export interface AdminUser {
    id: number;
    email: string;
    fullName: string;
    phone: string;
    role: string;
    partnerType?: string;
    parentPartnerId?: number;
    isActive: boolean;
    kycStatus: string;
    createdAt: string;
}

export interface AdminWallet {
    id: number;
    userId: number;
    userEmail: string;
    fullName: string;
    balance: number;
    currency: string;
}

export interface AdminTransaction {
    id: number;
    referenceNumber: string;
    senderWalletId?: number;
    senderEmail?: string;
    receiverWalletId?: number;
    receiverEmail?: string;
    amount: number;
    type: string;
    status: string;
    description: string;
    createdAt: string;
}

export interface AdminLedgerResponse {
    openingBalance: number;
    totalCredit: number;
    totalDebit: number;
    closingBalance: number;
    transactions: AdminTransaction[];
}

export interface WalletRechargeRequest {
    id: number;
    userId: number;
    userEmail: string;
    userName: string;
    amount: number;
    referenceNumber: string;
    transferMode: string;
    status: string;
    adminRemarks: string;
    createdAt: string;
    updatedAt: string;
}

export interface AdminUserDetailsResponse {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    role: string;
    partnerType?: string;
    partnerCode?: string;
    isActive: boolean;
    kycStatus: string;
    profile?: {
        aadhaarNumber: string;
        panNumber: string;
        city: string;
        state: string;
        pincode: string;
        completeAddress: string;
    };
    finance?: {
        walletBalance: number;
        virtualAccount: string;
        virtualIfsc: string;
        cappingAmount: number;
    };
    services: {
        serviceId: number;
        serviceName: string;
        authorized: boolean;
    }[];
    commissions: {
        serviceId: number;
        serviceName: string;
        yieldType: string;
        yieldValue: number;
        active: boolean;
    }[];
}

export interface HierarchyNodeDto {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    partnerCode?: string;
    partnerType?: string;
    isActive: boolean;
    children: HierarchyNodeDto[];
}

interface AdminState {
    stats: AdminDashboardStats | null;
    users: {
        content: AdminUser[];
        totalPages: number;
        totalElements: number;
    };
    partners: {
        content: AdminUser[];
        totalPages: number;
        totalElements: number;
    };
    wallets: {
        content: AdminWallet[];
        totalPages: number;
        totalElements: number;
    };
    transactions: {
        content: AdminTransaction[];
        totalPages: number;
        totalElements: number;
    };
    systemLedger: AdminLedgerResponse | null;
    partnerLedger: AdminLedgerResponse | null;
    hierarchyTree: HierarchyNodeDto[];
    rechargeRequests: WalletRechargeRequest[];
    selectedUserDetails: AdminUserDetailsResponse | null;
    loading: boolean;
    error: string | null;
}

const initialState: AdminState = {
    stats: null,
    users: { content: [], totalPages: 0, totalElements: 0 },
    partners: { content: [], totalPages: 0, totalElements: 0 },
    wallets: { content: [], totalPages: 0, totalElements: 0 },
    transactions: { content: [], totalPages: 0, totalElements: 0 },
    systemLedger: null,
    partnerLedger: null,
    hierarchyTree: [],
    rechargeRequests: [],
    selectedUserDetails: null,
    loading: false,
    error: null,
};

// Thunks
export const fetchDashboardStats = createAsyncThunk('admin/fetchDashboardStats', async (params: { startDate?: string, endDate?: string } | undefined, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8080/api/admin/dashboard/stats', {
            params,
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch stats');
    }
});

export const fetchAdminUsers = createAsyncThunk('admin/fetchAdminUsers', async (params: { page: number; size: number }, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8080/api/admin/users', {
            params,
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch users');
    }
});

export const fetchAdminPartners = createAsyncThunk('admin/fetchAdminPartners', async (params: { page: number; size: number }, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8080/api/admin/partners', {
            params,
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch partners');
    }
});

export const fetchHierarchyTree = createAsyncThunk('admin/fetchHierarchyTree', async (_, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8080/api/admin/hierarchy', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch hierarchy tree');
    }
});

export const toggleUserStatus = createAsyncThunk('admin/toggleUserStatus', async ({ id, active, type }: { id: number, active: boolean, type: 'USER' | 'PARTNER' }, { rejectWithValue, dispatch }) => {
    try {
        const token = localStorage.getItem('token');
        await axios.put(`http://localhost:8080/api/admin/users/${id}/status?active=${active}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return { id, active, type };
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || 'Failed to toggle status');
    }
});

export const createAdminPartner = createAsyncThunk('admin/createAdminPartner', async (partnerData: any, { rejectWithValue, dispatch }) => {
    try {
        const token = localStorage.getItem('token');
        await axios.post('http://localhost:8080/api/admin/partners', partnerData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        // Refetch partners after creation
        dispatch(fetchAdminPartners({ page: 0, size: 10 }));
        return true;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || 'Failed to create partner');
    }
});

export const fetchAdminWallets = createAsyncThunk('admin/fetchAdminWallets', async (params: { page: number; size: number }, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8080/api/admin/wallets', {
            params,
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch wallets');
    }
});

export const fetchAdminTransactions = createAsyncThunk('admin/fetchTransactions', async (params: { page: number, size: number, startDate?: string, endDate?: string, status?: string, type?: string, search?: string }, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8080/api/admin/transactions', {
            params,
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch transactions');
    }
});

export const approveTransaction = createAsyncThunk('admin/approveTransaction', async (id: number, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem('token');
        await axios.post(`http://localhost:8080/api/admin/transactions/${id}/approve`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return id;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || 'Failed to approve transaction');
    }
});


export const fetchSystemLedger = createAsyncThunk('admin/fetchSystemLedger', async (params: { startDate?: string, endDate?: string }, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8080/api/admin/finance/system-ledger', {
            params,
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch system ledger');
    }
});

export const fetchPartnerLedger = createAsyncThunk('admin/fetchPartnerLedger', async ({ partnerId, startDate, endDate }: { partnerId: number, startDate?: string, endDate?: string }, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:8080/api/admin/finance/partner-ledger/${partnerId}`, {
            params: { startDate, endDate },
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch partner ledger');
    }
});

export const fetchRechargeRequests = createAsyncThunk('admin/fetchRechargeRequests', async (_, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8080/api/admin/wallets/recharge-requests', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch recharge requests');
    }
});

export const approveRechargeRequest = createAsyncThunk('admin/approveRechargeRequest', async (data: { id: number, remarks: string }, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem('token');
        await axios.post(`http://localhost:8080/api/admin/wallets/recharge-requests/${data.id}/approve`, null, {
            params: { remarks: data.remarks },
            headers: { Authorization: `Bearer ${token}` }
        });
        return data.id;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || 'Failed to approve request');
    }
});

export const rejectRechargeRequest = createAsyncThunk('admin/rejectRechargeRequest', async (data: { id: number, remarks: string }, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem('token');
        await axios.post(`http://localhost:8080/api/admin/wallets/recharge-requests/${data.id}/reject`, null, {
            params: { remarks: data.remarks },
            headers: { Authorization: `Bearer ${token}` }
        });
        return data.id;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || 'Failed to reject request');
    }
});

export const adjustWalletBalance = createAsyncThunk('admin/adjustWalletBalance', async (data: { walletId: number, amount: number, type: 'CREDIT' | 'DEBIT', remark: string }, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem('token');
        await axios.post(`http://localhost:8080/api/admin/wallets/${data.walletId}/adjust`, {
            amount: data.amount,
            type: data.type,
            remark: data.remark
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return true;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || 'Failed to adjust wallet');
    }
});

export const fetchUserDetails = createAsyncThunk('admin/fetchUserDetails', async (userId: number, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:8080/api/admin/users/${userId}/details`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch user details');
    }
});

export const updateUserProfile = createAsyncThunk('admin/updateUserProfile', async (data: { userId: number, profileData: any }, { rejectWithValue, dispatch }) => {
    try {
        const token = localStorage.getItem('token');
        await axios.put(`http://localhost:8080/api/admin/users/${data.userId}/profile`, data.profileData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        dispatch(fetchUserDetails(data.userId));
        return true;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || 'Failed to update profile');
    }
});

export const updateUserFinance = createAsyncThunk('admin/updateUserFinance', async (data: { userId: number, financeData: any }, { rejectWithValue, dispatch }) => {
    try {
        const token = localStorage.getItem('token');
        await axios.put(`http://localhost:8080/api/admin/users/${data.userId}/finance`, data.financeData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        dispatch(fetchUserDetails(data.userId));
        return true;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || 'Failed to update finance');
    }
});

export const updateUserService = createAsyncThunk('admin/updateUserService', async (data: { userId: number, serviceData: any }, { rejectWithValue, dispatch }) => {
    try {
        const token = localStorage.getItem('token');
        await axios.put(`http://localhost:8080/api/admin/users/${data.userId}/services`, data.serviceData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        dispatch(fetchUserDetails(data.userId));
        return true;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || 'Failed to update service');
    }
});

export const updateUserCommission = createAsyncThunk('admin/updateUserCommission', async (data: { userId: number, commissionData: any }, { rejectWithValue, dispatch }) => {
    try {
        const token = localStorage.getItem('token');
        await axios.put(`http://localhost:8080/api/admin/users/${data.userId}/commissions`, data.commissionData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        dispatch(fetchUserDetails(data.userId));
        return true;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || 'Failed to update commission');
    }
});

const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // Dashboard Stats
        builder.addCase(fetchDashboardStats.pending, (state) => { state.loading = true; state.error = null; })
               .addCase(fetchDashboardStats.fulfilled, (state, action) => { state.loading = false; state.stats = action.payload; })
               .addCase(fetchDashboardStats.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
        
        // Users
        builder.addCase(fetchAdminUsers.pending, (state) => { state.loading = true; state.error = null; })
               .addCase(fetchAdminUsers.fulfilled, (state, action) => { 
                   state.loading = false; 
                   state.users.content = action.payload.content;
                   state.users.totalPages = action.payload.totalPages;
                   state.users.totalElements = action.payload.totalElements;
               })
               .addCase(fetchAdminUsers.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

        // Partners
        builder.addCase(fetchAdminPartners.pending, (state) => { state.loading = true; state.error = null; })
               .addCase(fetchAdminPartners.fulfilled, (state, action) => { 
                   state.loading = false; 
                   state.partners.content = action.payload.content;
                   state.partners.totalPages = action.payload.totalPages;
                   state.partners.totalElements = action.payload.totalElements;
               })
               .addCase(fetchAdminPartners.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

        // Hierarchy
        builder.addCase(fetchHierarchyTree.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchHierarchyTree.fulfilled, (state, action) => {
            state.loading = false;
            state.hierarchyTree = action.payload;
        })
        .addCase(fetchHierarchyTree.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // Toggle Status
        builder.addCase(toggleUserStatus.fulfilled, (state, action) => {
            const { id, active, type } = action.payload;
            if (type === 'USER') {
                const user = state.users.content.find(u => u.id === id);
                if (user) user.isActive = active;
            } else {
                const partner = state.partners.content.find(p => p.id === id);
                if (partner) partner.isActive = active;
            }
        });

        // Wallets
        builder.addCase(fetchAdminWallets.pending, (state) => { state.loading = true; state.error = null; })
               .addCase(fetchAdminWallets.fulfilled, (state, action) => { 
                   state.loading = false; 
                   state.wallets.content = action.payload.content;
                   state.wallets.totalPages = action.payload.totalPages;
                   state.wallets.totalElements = action.payload.totalElements;
               })
               .addCase(fetchAdminWallets.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

        // Transactions
        builder.addCase(fetchAdminTransactions.pending, (state) => { state.loading = true; state.error = null; })
               .addCase(fetchAdminTransactions.fulfilled, (state, action) => { 
                   state.loading = false; 
                   state.transactions.content = action.payload.content;
                   state.transactions.totalPages = action.payload.totalPages;
                   state.transactions.totalElements = action.payload.totalElements;
               })
               .addCase(fetchAdminTransactions.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

        // Approve Transaction
        builder.addCase(approveTransaction.fulfilled, (state, action) => {
            const id = action.payload;
            const tx = state.transactions.content.find(t => t.id === id);
            if (tx) {
                tx.status = 'SUCCESS';
            }
        });

        // Ledger & Requests
        builder.addCase(fetchSystemLedger.pending, (state) => { state.loading = true; state.error = null; })
               .addCase(fetchSystemLedger.fulfilled, (state, action) => { state.loading = false; state.systemLedger = action.payload; })
               .addCase(fetchSystemLedger.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

        builder.addCase(fetchPartnerLedger.pending, (state) => { state.loading = true; state.error = null; })
               .addCase(fetchPartnerLedger.fulfilled, (state, action) => { state.loading = false; state.partnerLedger = action.payload; })
               .addCase(fetchPartnerLedger.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

        builder.addCase(fetchRechargeRequests.pending, (state) => { state.loading = true; state.error = null; })
               .addCase(fetchRechargeRequests.fulfilled, (state, action) => { state.loading = false; state.rechargeRequests = action.payload; })
               .addCase(fetchRechargeRequests.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

        builder.addCase(approveRechargeRequest.fulfilled, (state, action) => {
            const req = state.rechargeRequests.find(r => r.id === action.payload);
            if (req) req.status = 'APPROVED';
        });
        
        builder.addCase(rejectRechargeRequest.fulfilled, (state, action) => {
            const req = state.rechargeRequests.find(r => r.id === action.payload);
            if (req) req.status = 'REJECTED';
        });

        // User Details
        builder.addCase(fetchUserDetails.pending, (state) => { state.loading = true; state.error = null; })
               .addCase(fetchUserDetails.fulfilled, (state, action) => { state.loading = false; state.selectedUserDetails = action.payload; })
               .addCase(fetchUserDetails.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
    }
});

export default adminSlice.reducer;
