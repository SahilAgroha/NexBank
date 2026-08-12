import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

export type KycStatus = 'UNVERIFIED' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface KycDocument {
  id: number;
  documentType: string;
  documentUrl: string;
  status: KycStatus;
  rejectionReason: string | null;
  uploadedAt: string;
}

export interface KycResponse {
  status: KycStatus;
  documents: KycDocument[];
}

interface KycState {
  status: KycStatus;
  documents: KycDocument[];
  pendingUsers: any[];
  approvedUsers: any[];
  unverifiedUsers: any[];
  loading: boolean;
  error: string | null;
}

const initialState: KycState = {
  status: 'UNVERIFIED',
  documents: [],
  pendingUsers: [],
  approvedUsers: [],
  unverifiedUsers: [],
  loading: false,
  error: null,
};

export const fetchKycStatus = createAsyncThunk(
  'kyc/fetchKycStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/kyc/status');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch KYC status');
    }
  }
);

export const uploadKycDocument = createAsyncThunk(
  'kyc/uploadDocument',
  async ({ file, documentType, partnerCode }: { file: File; documentType: string; partnerCode?: string }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);
      
      if (partnerCode) {
        formData.append('partnerCode', partnerCode);
      }
      
      const response = await api.post('/kyc/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload document');
    }
  }
);

export const linkPartner = createAsyncThunk(
  'kyc/linkPartner',
  async (partnerCode: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/users/link-partner?partnerCode=${encodeURIComponent(partnerCode)}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to link partner');
    }
  }
);

// Admin actions
export const fetchPendingKycUsers = createAsyncThunk(
  'kyc/fetchPendingKycUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/kyc/pending');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending KYC');
    }
  }
);

export const approveKyc = createAsyncThunk(
  'kyc/approveKyc',
  async (userId: number, { rejectWithValue }) => {
    try {
      await api.post(`/admin/kyc/approve/${userId}`);
      return userId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve KYC');
    }
  }
);

export const rejectKyc = createAsyncThunk(
  'kyc/rejectKyc',
  async ({ userId, reason }: { userId: number; reason: string }, { rejectWithValue }) => {
    try {
      await api.post(`/admin/kyc/reject/${userId}?reason=${encodeURIComponent(reason)}`);
      return userId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject KYC');
    }
  }
);

export const fetchApprovedKycUsers = createAsyncThunk(
  'kyc/fetchApprovedKycUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/kyc/approved');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch approved KYC users');
    }
  }
);

export const fetchUnverifiedUsers = createAsyncThunk(
  'kyc/fetchUnverifiedUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/kyc/unverified');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch unverified users');
    }
  }
);

export const sendKycRequest = createAsyncThunk(
  'kyc/sendKycRequest',
  async ({ userId, dueDate, message }: { userId: number; dueDate: string; message: string }, { rejectWithValue }) => {
    try {
      await api.post('/admin/kyc/request', { userId, dueDate, message });
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send KYC request');
    }
  }
);

export const suspendKyc = createAsyncThunk(
  'kyc/suspendKyc',
  async ({ userId, reason }: { userId: number; reason?: string }, { rejectWithValue }) => {
    try {
      await api.post(`/admin/kyc/suspend/${userId}`, null, {
        params: { reason }
      });
      return userId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to suspend KYC');
    }
  }
);

// Partner Customer KYC actions
export const fetchPartnerPendingKycUsers = createAsyncThunk(
  'kyc/fetchPartnerPendingKycUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/partner/customer-kyc/pending');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending customer KYC');
    }
  }
);

export const approvePartnerKyc = createAsyncThunk(
  'kyc/approvePartnerKyc',
  async (userId: number, { rejectWithValue }) => {
    try {
      await api.post(`/partner/customer-kyc/approve/${userId}`);
      return userId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve customer KYC');
    }
  }
);

export const rejectPartnerKyc = createAsyncThunk(
  'kyc/rejectPartnerKyc',
  async ({ userId, reason }: { userId: number; reason: string }, { rejectWithValue }) => {
    try {
      await api.post(`/partner/customer-kyc/reject/${userId}?reason=${encodeURIComponent(reason)}`);
      return userId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject customer KYC');
    }
  }
);

export const fetchPartnerApprovedKycUsers = createAsyncThunk(
  'kyc/fetchPartnerApprovedKycUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/partner/customer-kyc/approved');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch approved customer KYC users');
    }
  }
);

export const fetchPartnerUnverifiedUsers = createAsyncThunk(
  'kyc/fetchPartnerUnverifiedUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/partner/customer-kyc/unverified');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch unverified customer users');
    }
  }
);

export const sendPartnerKycRequest = createAsyncThunk(
  'kyc/sendPartnerKycRequest',
  async ({ userId, dueDate, message }: { userId: number; dueDate: string; message: string }, { rejectWithValue }) => {
    try {
      await api.post('/partner/customer-kyc/request', { userId, dueDate, message });
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send KYC request');
    }
  }
);

export const suspendPartnerKyc = createAsyncThunk(
  'kyc/suspendPartnerKyc',
  async ({ userId, reason }: { userId: number; reason?: string }, { rejectWithValue }) => {
    try {
      await api.post(`/partner/customer-kyc/suspend/${userId}`, null, {
        params: { reason }
      });
      return userId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to suspend KYC');
    }
  }
);

const kycSlice = createSlice({
  name: 'kyc',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Status
      .addCase(fetchKycStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchKycStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.status = action.payload.status;
        state.documents = action.payload.documents;
      })
      .addCase(fetchKycStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Upload Document
      .addCase(uploadKycDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadKycDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.status = 'PENDING';
        state.documents.push(action.payload);
      })
      .addCase(uploadKycDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Link Partner
      .addCase(linkPartner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(linkPartner.fulfilled, (state) => {
        state.loading = false;
        // Optionally update some state if needed
      })
      .addCase(linkPartner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Pending (Admin)
      .addCase(fetchPendingKycUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingKycUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingUsers = action.payload;
      })
      .addCase(fetchPendingKycUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Approve KYC
      .addCase(approveKyc.fulfilled, (state, action) => {
        state.pendingUsers = state.pendingUsers.filter(user => user.id !== action.payload);
      })
      
      // Reject KYC
      .addCase(rejectKyc.fulfilled, (state, action) => {
        state.pendingUsers = state.pendingUsers.filter(user => user.id !== action.payload);
      })
      
      // Approved History
      .addCase(fetchApprovedKycUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchApprovedKycUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.approvedUsers = action.payload;
      })
      
      // Unverified Users
      .addCase(fetchUnverifiedUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUnverifiedUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.unverifiedUsers = action.payload;
      })
      
      // Partner Equivalents
      .addCase(fetchPartnerPendingKycUsers.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchPartnerPendingKycUsers.fulfilled, (state, action) => { state.loading = false; state.pendingUsers = action.payload; })
      .addCase(fetchPartnerPendingKycUsers.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      
      .addCase(approvePartnerKyc.fulfilled, (state, action) => { state.pendingUsers = state.pendingUsers.filter(user => user.id !== action.payload); })
      .addCase(rejectPartnerKyc.fulfilled, (state, action) => { state.pendingUsers = state.pendingUsers.filter(user => user.id !== action.payload); })
      
      .addCase(fetchPartnerApprovedKycUsers.pending, (state) => { state.loading = true; })
      .addCase(fetchPartnerApprovedKycUsers.fulfilled, (state, action) => { state.loading = false; state.approvedUsers = action.payload; })
      
      .addCase(fetchPartnerUnverifiedUsers.pending, (state) => { state.loading = true; })
      .addCase(fetchPartnerUnverifiedUsers.fulfilled, (state, action) => { state.loading = false; state.unverifiedUsers = action.payload; });
  },
});

export default kycSlice.reducer;
