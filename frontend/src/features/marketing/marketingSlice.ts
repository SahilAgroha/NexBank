import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

export interface Banner {
  id: number;
  title: string;
  imageUrl: string;
  targetUrl: string;
  active: boolean;
  placement: 'HOME' | 'DASHBOARD';
  createdAt: string;
}

export interface MarketingHistory {
  id: number;
  type: string;
  subject?: string;
  message: string;
  recipientCount: number;
  status: string;
  sentAt: string;
}

export interface News {
  id: number;
  title: string;
  content: string;
  published: boolean;
  createdAt: string;
}

interface MarketingState {
  banners: Banner[];
  news: News[];
  messageHistory: MarketingHistory[];
  loading: boolean;
  error: string | null;
}

const initialState: MarketingState = {
  banners: [],
  news: [],
  messageHistory: [],
  loading: false,
  error: null
};

export const fetchAllBanners = createAsyncThunk('marketing/fetchAllBanners', async () => {
  const response = await api.get('/marketing/admin/banners');
  return response.data;
});

export const fetchAllNews = createAsyncThunk('marketing/fetchAllNews', async () => {
  const response = await api.get('/marketing/admin/news');
  return response.data;
});

export const fetchActiveBanners = createAsyncThunk('marketing/fetchActiveBanners', async (placement?: string) => {
  const response = await api.get(`/marketing/banners/active${placement ? `?placement=${placement}` : ''}`);
  return response.data;
});

export const fetchPublishedNews = createAsyncThunk('marketing/fetchPublishedNews', async () => {
  const response = await api.get('/marketing/news/published');
  return response.data;
});

export const createBanner = createAsyncThunk('marketing/createBanner', async (bannerData: FormData) => {
  const response = await api.post('/marketing/admin/banners', bannerData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
});

export const updateBanner = createAsyncThunk('marketing/updateBanner', async ({ id, data }: { id: number, data: FormData }) => {
  const response = await api.put(`/marketing/admin/banners/${id}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
});

export const deleteBanner = createAsyncThunk('marketing/deleteBanner', async (id: number) => {
  await api.delete(`/marketing/admin/banners/${id}`);
  return id;
});

export const createNews = createAsyncThunk('marketing/createNews', async (news: Partial<News>) => {
  const response = await api.post('/marketing/admin/news', news);
  return response.data;
});

export const updateNews = createAsyncThunk('marketing/updateNews', async ({ id, data }: { id: number, data: Partial<News> }) => {
  const response = await api.put(`/marketing/admin/news/${id}`, data);
  return response.data;
});

export const deleteNews = createAsyncThunk('marketing/deleteNews', async (id: number) => {
  await api.delete(`/marketing/admin/news/${id}`);
  return id;
});

export const sendSmsMessage = createAsyncThunk('marketing/sendSmsMessage', async (data: { userIds: number[], message: string }) => {
  const response = await api.post('/marketing/admin/send-sms', data);
  return response.data;
});

export const sendWhatsAppMessage = createAsyncThunk('marketing/sendWhatsAppMessage', async (data: { userIds: number[], message: string }) => {
  const response = await api.post('/marketing/admin/send-whatsapp', data);
  return response.data;
});

export const sendEmailMessage = createAsyncThunk('marketing/sendEmailMessage', async (data: { userIds: number[], message: string, subject?: string }) => {
  const response = await api.post('/marketing/admin/send-email', data);
  return response.data;
});

export const fetchMarketingHistory = createAsyncThunk('marketing/fetchHistory', async (type: string) => {
  const response = await api.get(`/marketing/admin/history?type=${type}`);
  return response.data;
});

const marketingSlice = createSlice({
  name: 'marketing',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllBanners.pending, (state) => { state.loading = true; })
      .addCase(fetchAllBanners.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = action.payload;
      })
      .addCase(fetchAllBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch banners';
      })
      .addCase(fetchAllNews.pending, (state) => { state.loading = true; })
      .addCase(fetchAllNews.fulfilled, (state, action) => {
        state.loading = false;
        state.news = action.payload;
      })
      .addCase(fetchAllNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch news';
      })
      .addCase(fetchActiveBanners.pending, (state) => { state.loading = true; })
      .addCase(fetchActiveBanners.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = action.payload;
      })
      .addCase(fetchPublishedNews.pending, (state) => { state.loading = true; })
      .addCase(fetchPublishedNews.fulfilled, (state, action) => {
        state.loading = false;
        state.news = action.payload;
      })
      .addCase(fetchMarketingHistory.pending, (state) => { state.loading = true; })
      .addCase(fetchMarketingHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.messageHistory = action.payload;
      })
      .addCase(createBanner.fulfilled, (state, action) => {
        state.banners.push(action.payload);
      })
      .addCase(updateBanner.fulfilled, (state, action) => {
        const index = state.banners.findIndex(b => b.id === action.payload.id);
        if (index !== -1) state.banners[index] = action.payload;
      })
      .addCase(deleteBanner.fulfilled, (state, action) => {
        state.banners = state.banners.filter(b => b.id !== action.payload);
      })
      .addCase(createNews.fulfilled, (state, action) => {
        state.news.push(action.payload);
      })
      .addCase(updateNews.fulfilled, (state, action) => {
        const index = state.news.findIndex(n => n.id === action.payload.id);
        if (index !== -1) state.news[index] = action.payload;
      })
      .addCase(deleteNews.fulfilled, (state, action) => {
        state.news = state.news.filter(n => n.id !== action.payload);
      });
  },
});

export default marketingSlice.reducer;
