import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export interface PlatformService {
    id: number;
    name: string;
    type: string;
    icon?: string;
    isActive: boolean;
    createdAt: string;
}

export interface ServiceNode {
    id: number;
    platformServiceId: number;
    platformServiceName: string;
    name: string;
    operatorCode: string;
    isActive: boolean;
}

interface ServiceState {
    services: PlatformService[];
    serviceNodes: ServiceNode[];
    loading: boolean;
    error: string | null;
}

const initialState: ServiceState = {
    services: [],
    serviceNodes: [],
    loading: false,
    error: null,
};

const API_URL = 'http://localhost:8080/api/admin';

export const fetchServices = createAsyncThunk('services/fetchServices', async (_, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/services`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch services');
    }
});

export const createService = createAsyncThunk('services/createService', async (data: Partial<PlatformService>, { rejectWithValue, dispatch }) => {
    try {
        const token = localStorage.getItem('token');
        await axios.post(`${API_URL}/services`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        dispatch(fetchServices());
        return true;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || 'Failed to create service');
    }
});

export const toggleServiceStatus = createAsyncThunk('services/toggleServiceStatus', async ({ id, active }: { id: number, active: boolean }, { rejectWithValue, dispatch }) => {
    try {
        const token = localStorage.getItem('token');
        await axios.put(`${API_URL}/services/${id}/status?active=${active}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        dispatch(fetchServices());
        return true;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || 'Failed to toggle status');
    }
});

export const fetchServiceNodes = createAsyncThunk('services/fetchServiceNodes', async (_, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/service-nodes`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.data;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch service nodes');
    }
});

export const createServiceNode = createAsyncThunk('services/createServiceNode', async (data: Partial<ServiceNode>, { rejectWithValue, dispatch }) => {
    try {
        const token = localStorage.getItem('token');
        await axios.post(`${API_URL}/service-nodes`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        dispatch(fetchServiceNodes());
        return true;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || 'Failed to create service node');
    }
});

export const toggleServiceNodeStatus = createAsyncThunk('services/toggleServiceNodeStatus', async ({ id, active }: { id: number, active: boolean }, { rejectWithValue, dispatch }) => {
    try {
        const token = localStorage.getItem('token');
        await axios.put(`${API_URL}/service-nodes/${id}/status?active=${active}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        dispatch(fetchServiceNodes());
        return true;
    } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || 'Failed to toggle node status');
    }
});

const serviceSlice = createSlice({
    name: 'services',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // Services
        builder.addCase(fetchServices.pending, (state) => { state.loading = true; state.error = null; });
        builder.addCase(fetchServices.fulfilled, (state, action) => { state.loading = false; state.services = action.payload; });
        builder.addCase(fetchServices.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
        
        // Service Nodes
        builder.addCase(fetchServiceNodes.pending, (state) => { state.loading = true; state.error = null; });
        builder.addCase(fetchServiceNodes.fulfilled, (state, action) => { state.loading = false; state.serviceNodes = action.payload; });
        builder.addCase(fetchServiceNodes.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
    }
});

export default serviceSlice.reducer;
