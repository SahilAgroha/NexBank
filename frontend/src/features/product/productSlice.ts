import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  createdAt: string;
}

interface ProductState {
  products: {
    content: Product[];
    totalPages: number;
    totalElements: number;
  };
  loading: boolean;
  error: string | null;
  actionLoading: boolean;
}

const initialState: ProductState = {
  products: {
    content: [],
    totalPages: 0,
    totalElements: 0,
  },
  loading: false,
  error: null,
  actionLoading: false,
};

export const fetchAdminProducts = createAsyncThunk('products/fetchAdmin', async (params: { page?: number; size?: number } = {}, { rejectWithValue }) => {
  try {
    const response = await api.get('/admin/products', { params });
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
  }
});

export const fetchActiveProducts = createAsyncThunk('products/fetchActive', async (params: { page?: number; size?: number } = {}, { rejectWithValue }) => {
  try {
    const response = await api.get('/products', { params });
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch active products');
  }
});

export const createProduct = createAsyncThunk('products/create', async (data: { name: string; description: string; price: number; isActive: boolean }, { rejectWithValue, dispatch }) => {
  try {
    const response = await api.post('/admin/products', data);
    dispatch(fetchAdminProducts());
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create product');
  }
});

export const updateProduct = createAsyncThunk('products/update', async (data: { id: number; name: string; description: string; price: number; isActive: boolean }, { rejectWithValue, dispatch }) => {
  try {
    const response = await api.put(`/admin/products/${data.id}`, data);
    dispatch(fetchAdminProducts());
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update product');
  }
});

export const deleteProduct = createAsyncThunk('products/delete', async (id: number, { rejectWithValue, dispatch }) => {
  try {
    await api.delete(`/admin/products/${id}`);
    dispatch(fetchAdminProducts());
    return id;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete product');
  }
});

export const toggleProductActivation = createAsyncThunk('products/toggle', async (id: number, { rejectWithValue, dispatch }) => {
  try {
    const response = await api.patch(`/admin/products/${id}/toggle-activation`);
    dispatch(fetchAdminProducts());
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to toggle product status');
  }
});

export const purchaseProduct = createAsyncThunk('products/purchase', async (data: { productId: number; quantity: number }, { rejectWithValue }) => {
  try {
    const response = await api.post(`/products/${data.productId}/purchase`, null, { params: { quantity: data.quantity } });
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to purchase product');
  }
});

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchAdminProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchActiveProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchActiveProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchActiveProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default productSlice.reducer;
