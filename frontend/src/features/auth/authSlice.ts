import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/api';

interface AuthState {
  token: string | null;
  user: {
    id: number;
    email: string;
    fullName: string;
    role: string;
  } | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: localStorage.getItem('token'),
  user: localStorage.getItem('user') && localStorage.getItem('user') !== 'undefined' ? JSON.parse(localStorage.getItem('user') as string) : null,
  loading: false,
  error: null,
};

export const register = createAsyncThunk(
  'auth/register',
  async (data: { formData: any; portal: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/auth/${data.portal}/register`, data.formData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const verifySignup = createAsyncThunk(
  'auth/verifySignup',
  async (data: { email: string; otpCode: string; portal: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/auth/${data.portal}/verify-signup`, {
        email: data.email,
        otpCode: data.otpCode
      });
      const token = response.data.data.token;
      localStorage.setItem('token', token);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Verification failed');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (data: { credentials: any; portal: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/auth/${data.portal}/login`, data.credentials);
      const token = response.data.data.token;
      localStorage.setItem('token', token);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data: { fullName: string; phone: string }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.put('/users/profile', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (data: { oldPassword: string; newPassword: string }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.put('/users/password', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to change password');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: AuthState['user'] }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
        // Do not set token here, wait for OTP verification
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(verifySignup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifySignup.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        const userObj = {
          id: action.payload.id,
          email: action.payload.email,
          fullName: action.payload.fullName,
          role: action.payload.role,
        };
        state.user = userObj;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(userObj));
      })
      .addCase(verifySignup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        const userObj = {
          id: action.payload.id,
          email: action.payload.email,
          fullName: action.payload.fullName,
          role: action.payload.role,
        };
        state.user = userObj;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(userObj));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        if (state.user) {
          state.user = {
            ...state.user,
            fullName: action.payload.fullName,
          };
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      });
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
