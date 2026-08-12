import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

export interface SupportTicket {
  id: number;
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: string;
  createdAt: string;
  updatedAt: string;
  user?: any;
}

export interface SupportMessage {
  id: number;
  message: string;
  sender: { id: number; fullName: string; role: string };
  createdAt: string;
}

interface SupportState {
  tickets: SupportTicket[];
  currentTicket: SupportTicket | null;
  currentMessages: SupportMessage[];
  loading: boolean;
  error: string | null;
}

const initialState: SupportState = {
  tickets: [],
  currentTicket: null,
  currentMessages: [],
  loading: false,
  error: null,
};

export const fetchMyTickets = createAsyncThunk('support/fetchMyTickets', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/support/tickets');
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch tickets');
  }
});

export const fetchAllTickets = createAsyncThunk('support/fetchAllTickets', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/admin/support/tickets');
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch all tickets');
  }
});

export const fetchTicketDetails = createAsyncThunk('support/fetchTicketDetails', async ({ id, isAdmin }: { id: number, isAdmin?: boolean }, { rejectWithValue }) => {
  try {
    const endpoint = isAdmin ? `/admin/support/tickets/${id}` : `/support/tickets/${id}`;
    const response = await api.get(endpoint);
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch ticket details');
  }
});

export const createTicket = createAsyncThunk('support/createTicket', async (data: { subject: string; description: string; category: string; priority: string }, { rejectWithValue }) => {
  try {
    const response = await api.post('/support/tickets', data);
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create ticket');
  }
});

export const addMessage = createAsyncThunk('support/addMessage', async ({ id, message, isAdmin }: { id: number, message: string, isAdmin?: boolean }, { rejectWithValue }) => {
  try {
    const endpoint = isAdmin ? `/admin/support/tickets/${id}/messages` : `/support/tickets/${id}/messages`;
    const response = await api.post(endpoint, { message });
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to add message');
  }
});

export const updateTicketStatus = createAsyncThunk('support/updateTicketStatus', async ({ id, status }: { id: number, status: string }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/admin/support/tickets/${id}/status`, { status });
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update ticket status');
  }
});

const supportSlice = createSlice({
  name: 'support',
  initialState,
  reducers: {
    clearCurrentTicket: (state) => {
      state.currentTicket = null;
      state.currentMessages = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyTickets.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchMyTickets.fulfilled, (state, action) => { state.loading = false; state.tickets = action.payload; })
      .addCase(fetchMyTickets.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      
      .addCase(fetchAllTickets.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAllTickets.fulfilled, (state, action) => { state.loading = false; state.tickets = action.payload; })
      .addCase(fetchAllTickets.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

      .addCase(fetchTicketDetails.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTicketDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTicket = action.payload.ticket;
        state.currentMessages = action.payload.messages;
      })
      .addCase(fetchTicketDetails.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

      .addCase(createTicket.fulfilled, (state, action) => {
        state.tickets.unshift(action.payload);
      })

      .addCase(addMessage.fulfilled, (state, action) => {
        state.currentMessages.push(action.payload);
      })
      
      .addCase(updateTicketStatus.fulfilled, (state, action) => {
        if (state.currentTicket && state.currentTicket.id === action.payload.id) {
          state.currentTicket.status = action.payload.status;
        }
        const index = state.tickets.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tickets[index].status = action.payload.status;
        }
      });
  },
});

export const { clearCurrentTicket } = supportSlice.actions;
export default supportSlice.reducer;
