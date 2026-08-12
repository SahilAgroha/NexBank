import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

export interface SystemSetting {
  id?: number;
  settingKey: string;
  settingValue: string;
  category: 'BRAND' | 'EMAIL' | 'SMS' | 'WHATSAPP' | 'COMPANY' | 'COMPLIANCE';
}

export interface AuditLog {
  id: number;
  adminId: number;
  adminName: string;
  action: string;
  entityName: string;
  entityId: number;
  details: string;
  ipAddress: string;
  timestamp: string;
}

interface SettingsState {
  settings: SystemSetting[];
  auditLogs: AuditLog[];
  loading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  settings: [],
  auditLogs: [],
  loading: false,
  error: null
};

export const fetchSettings = createAsyncThunk('settings/fetchSettings', async () => {
  const response = await api.get('/settings');
  return response.data;
});

export const updateSettingsBatch = createAsyncThunk('settings/updateSettingsBatch', async (settings: SystemSetting[]) => {
  await api.post('/settings/batch', settings);
  return settings;
});

export const fetchAuditLogs = createAsyncThunk('settings/fetchAuditLogs', async () => {
  const response = await api.get('/audit-logs');
  return response.data;
});

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => { state.loading = true; })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch settings';
      })
      .addCase(updateSettingsBatch.fulfilled, (state, action) => {
        const newSettings = action.payload;
        newSettings.forEach(newSetting => {
          const index = state.settings.findIndex(s => s.settingKey === newSetting.settingKey);
          if (index !== -1) {
            state.settings[index] = newSetting;
          } else {
            state.settings.push(newSetting);
          }
        });
      })
      .addCase(fetchAuditLogs.pending, (state) => { state.loading = true; })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.auditLogs = action.payload;
      });
  },
});

export default settingsSlice.reducer;
