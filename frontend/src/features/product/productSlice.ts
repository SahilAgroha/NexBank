import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  category?: string;
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

type ProductParams = {
  page?: number;
  size?: number;
};

/* =========================
   FETCH ADMIN PRODUCTS
========================= */

export const fetchAdminProducts = createAsyncThunk<
  any,
  ProductParams | undefined,
  { rejectValue: string }
>(
  'products/fetchAdmin',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/products', {
        params,
      });

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to fetch products'
      );
    }
  }
);

/* =========================
   FETCH ACTIVE PRODUCTS
========================= */

export const fetchActiveProducts = createAsyncThunk<
  any,
  ProductParams | undefined,
  { rejectValue: string }
>(
  'products/fetchActive',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/products', {
        params,
      });

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to fetch active products'
      );
    }
  }
);

/* =========================
   CREATE PRODUCT
========================= */

export const createProduct = createAsyncThunk<
  any,
  {
    name: string;
    description: string;
    price: number;
    isActive: boolean;
  },
  { rejectValue: string }
>(
  'products/create',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post(
        '/admin/products',
        data
      );

      dispatch(fetchAdminProducts());

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to create product'
      );
    }
  }
);

/* =========================
   UPDATE PRODUCT
========================= */

export const updateProduct = createAsyncThunk<
  any,
  {
    id: number;
    name: string;
    description: string;
    price: number;
    isActive: boolean;
  },
  { rejectValue: string }
>(
  'products/update',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.put(
        `/admin/products/${data.id}`,
        data
      );

      dispatch(fetchAdminProducts());

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to update product'
      );
    }
  }
);

/* =========================
   DELETE PRODUCT
========================= */

export const deleteProduct = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>(
  'products/delete',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/admin/products/${id}`);

      dispatch(fetchAdminProducts());

      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to delete product'
      );
    }
  }
);

/* =========================
   TOGGLE PRODUCT
========================= */

export const toggleProductActivation = createAsyncThunk<
  any,
  number,
  { rejectValue: string }
>(
  'products/toggle',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.patch(
        `/admin/products/${id}/toggle-activation`
      );

      dispatch(fetchAdminProducts());

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to toggle product status'
      );
    }
  }
);

/* =========================
   PURCHASE PRODUCT
========================= */

export const purchaseProduct = createAsyncThunk<
  any,
  {
    productId: number;
    quantity: number;
  },
  { rejectValue: string }
>(
  'products/purchase',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/products/${data.productId}/purchase`,
        null,
        {
          params: {
            quantity: data.quantity,
          },
        }
      );

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to purchase product'
      );
    }
  }
);

/* =========================
   SLICE
========================= */

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder

      /* Admin Products */
      .addCase(
        fetchAdminProducts.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchAdminProducts.fulfilled,
        (state, action) => {
          state.loading = false;
          state.products = action.payload;
        }
      )

      .addCase(
        fetchAdminProducts.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload || 'Failed to fetch products';
        }
      )

      /* Active Products */
      .addCase(
        fetchActiveProducts.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchActiveProducts.fulfilled,
        (state, action) => {
          state.loading = false;
          state.products = action.payload;
        }
      )

      .addCase(
        fetchActiveProducts.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.payload ||
            'Failed to fetch active products';
        }
      );
  },
});

export default productSlice.reducer;