import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

export const fetchNotifications = createAsyncThunk('notification/fetchNotifications', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/notifications');
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
  }
});

export const fetchUnreadCount = createAsyncThunk('notification/fetchUnreadCount', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/notifications/unread-count');
    return response.data.data.count;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch unread count');
  }
});

export const markAsRead = createAsyncThunk('notification/markAsRead', async (id: number, { rejectWithValue }) => {
  try {
    await api.put(`/notifications/${id}/read`);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to mark notification as read');
  }
});

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchNotifications.fulfilled, (state, action) => { 
        state.loading = false; 
        state.notifications = action.payload; 
      })
      .addCase(fetchNotifications.rejected, (state, action) => { 
        state.loading = false; 
        state.error = action.payload as string; 
      })
      
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })

      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload);
        if (notification && !notification.read) {
          notification.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });
  },
});

export default notificationSlice.reducer;
