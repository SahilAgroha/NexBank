import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import walletReducer from '../features/wallet/walletSlice';
import partnerReducer from '../features/partner/partnerSlice';
import kycReducer from '../features/kyc/kycSlice';
import serviceReducer from '../features/services/serviceSlice';
import ledgerReducer from '../features/ledger/ledgerSlice';
import adminReducer from '../features/admin/adminSlice';
import adminRechargeReducer from '../features/admin/adminRechargeSlice';
import productReducer from '../features/product/productSlice';
import invoiceReducer from '../features/invoice/invoiceSlice';
import supportReducer from '../features/support/supportSlice';
import notificationReducer from '../features/notification/notificationSlice';
import marketingReducer from '../features/marketing/marketingSlice';
import settingsReducer from '../features/settings/settingsSlice';
import customerManagementReducer from '../features/admin/customerManagementSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    wallet: walletReducer,
    partner: partnerReducer,
    kyc: kycReducer,
    services: serviceReducer,
    ledger: ledgerReducer,
    admin: adminReducer,
    adminRecharge: adminRechargeReducer,
    product: productReducer,
    invoice: invoiceReducer,
    support: supportReducer,
    notification: notificationReducer,
    marketing: marketingReducer,
    settings: settingsReducer,
    customerManagement: customerManagementReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
