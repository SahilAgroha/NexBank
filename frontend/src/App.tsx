import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; // HMR trigger
import { useSelector } from 'react-redux';
import type { RootState } from './store/store';
import UserLogin from './pages/auth/UserLogin';
import UserRegister from './pages/auth/UserRegister';
import PartnerLogin from './pages/auth/PartnerLogin';
import PartnerRegister from './pages/auth/PartnerRegister';
import AdminLogin from './pages/auth/AdminLogin';
import OtpVerification from './pages/auth/OtpVerification';
import DashboardLayout from './components/layout/DashboardLayout';
import ComingSoon from './pages/common/ComingSoon';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminKycApproval from './pages/admin/AdminKycApproval';
import AdminRecharges from './pages/admin/AdminRecharges';
import PartnerDashboard from './pages/partner/PartnerDashboard';
import PartnerCustomers from './pages/partner/PartnerCustomers';
import PartnerHierarchy from './pages/partner/PartnerHierarchy';
import UserKyc from './pages/customer/UserKyc';
import PartnerKyc from './pages/partner/PartnerKyc';
import PartnerCustomerKyc from './pages/partner/PartnerCustomerKyc';
import UserWallet from './pages/customer/UserWallet';
import UserTransfers from './pages/customer/UserTransfers';
import UserTransactions from './pages/customer/UserTransactions';
import PartnerWallet from './pages/partner/PartnerWallet';
import Landing from './pages/Landing';
import SystemLedger from './pages/admin/wallets/SystemLedger';
import MyLedger from './pages/common/MyLedger';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPartners from './pages/admin/AdminPartners';
import AdminWallets from './pages/admin/AdminWallets';
import AdminServices from './pages/admin/services/AdminServices';
import AdminServiceNodes from './pages/admin/services/AdminServiceNodes';
import AdminHierarchy from './pages/admin/hierarchy/AdminHierarchy';
import PartnerLedger from './pages/admin/wallets/PartnerLedger';
import WalletRechargeRequests from './pages/admin/wallets/WalletRechargeRequests';
import WalletTransfers from './pages/admin/wallets/WalletTransfers';
import AdminInvoices from './pages/admin/wallets/AdminInvoices';
import PurchaseRecords from './pages/admin/wallets/PurchaseRecords';
import AdminUserDetails from './pages/admin/users/AdminUserDetails';
import AdminSupport from './pages/admin/AdminSupport';
import AdminMarginSettings from './pages/admin/AdminMarginSettings';
import AdminBankAccounts from './pages/admin/AdminBankAccounts';
import AdminSettlementAccounts from './pages/admin/AdminSettlementAccounts';
import AdminTransactions from './pages/admin/transactions/AdminTransactions';
import AdminPendingApprovals from './pages/admin/transactions/AdminPendingApprovals';
import AdminPayouts from './pages/admin/transactions/AdminPayouts';
import AdminGatewayTransactions from './pages/admin/transactions/AdminGatewayTransactions';
import AdminFailedTransactions from './pages/admin/transactions/AdminFailedTransactions';
import AdminSettlements from './pages/admin/transactions/AdminSettlements';
import AdminProducts from './pages/admin/AdminProducts';
import Services from './pages/partner/Services';
import Invoices from './pages/partner/Invoices';
import Notifications from './pages/common/Notifications';
import PartnerSupport from './pages/partner/PartnerSupport';
import CustomerSupport from './pages/customer/CustomerSupport';
import AdminSettings from './pages/admin/AdminSettings';
import AdminMarketing from './pages/admin/AdminMarketing';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import MarketingWhatsApp from './pages/admin/marketing/MarketingWhatsApp';
import MarketingSMS from './pages/admin/marketing/MarketingSMS';
import MarketingEmail from './pages/admin/marketing/MarketingEmail';
import MarketingNews from './pages/admin/marketing/MarketingNews';
import MarketingBanners from './pages/admin/marketing/MarketingBanners';
import MarketingLogo from './pages/admin/marketing/MarketingLogo';
import PartnerSettings from './pages/partner/PartnerSettings';

const App = () => {
  const { token, user } = useSelector((state: RootState) => state.auth);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        
        {/* Auth Portals */}
        <Route path="/user/login" element={(!token || !user) ? <UserLogin /> : <Navigate to={`/${user?.role.toLowerCase()}/dashboard`} />} />
        <Route path="/user/register" element={(!token || !user) ? <UserRegister /> : <Navigate to={`/${user?.role.toLowerCase()}/dashboard`} />} />
        
        <Route path="/partner/login" element={(!token || !user) ? <PartnerLogin /> : <Navigate to={`/${user?.role.toLowerCase()}/dashboard`} />} />
        <Route path="/partner/register" element={(!token || !user) ? <PartnerRegister /> : <Navigate to={`/${user?.role.toLowerCase()}/dashboard`} />} />
        
        <Route path="/admin/login" element={(!token || !user) ? <AdminLogin /> : <Navigate to={`/${user?.role.toLowerCase()}/dashboard`} />} />
        
        <Route path="/verify-otp" element={<OtpVerification />} />

        {/* Protected Routes */}
        <Route path="/" element={(token && user) ? <DashboardLayout /> : <Navigate to="/user/login" />}>
          
          {/* Common routes */}
          <Route path="/notifications" element={<Notifications />} />

          {/* Admin Routes */}
          {user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' ? (
            <>
              <Route path="admin/dashboard" element={<AdminDashboard />} />
              <Route path="admin/transactions" element={<AdminTransactions />} />
              <Route path="admin/transactions/pending" element={<AdminPendingApprovals />} />
              <Route path="admin/transactions/payouts" element={<AdminPayouts />} />
              <Route path="admin/transactions/gateway" element={<AdminGatewayTransactions />} />
              <Route path="admin/transactions/failed" element={<AdminFailedTransactions />} />
              <Route path="admin/transactions/settlement" element={<AdminSettlements />} />
              <Route path="admin/wallets" element={<AdminWallets />} />
              <Route path="admin/system-ledger" element={<SystemLedger />} />
              <Route path="admin/partner-ledger" element={<PartnerLedger />} />
              <Route path="admin/wallet-requests" element={<WalletRechargeRequests />} />
              <Route path="admin/wallet-transfers" element={<WalletTransfers />} />
              <Route path="admin/invoices" element={<AdminInvoices />} />
              <Route path="admin/purchase-records" element={<PurchaseRecords />} />
              <Route path="admin/customers" element={<AdminUsers />} />
              <Route path="admin/user/:id" element={<AdminUserDetails />} />
              <Route path="admin/margin-settings" element={<AdminMarginSettings />} />
              <Route path="admin/bank-accounts" element={<AdminBankAccounts />} />
              <Route path="admin/settlement-accounts" element={<AdminSettlementAccounts />} />
              <Route path="admin/partners" element={<AdminPartners />} />
              <Route path="admin/marketing" element={<AdminMarketing />} />
              <Route path="admin/marketing/whatsapp" element={<MarketingWhatsApp />} />
              <Route path="admin/marketing/sms" element={<MarketingSMS />} />
              <Route path="admin/marketing/email" element={<MarketingEmail />} />
              <Route path="admin/marketing/news" element={<MarketingNews />} />
              <Route path="admin/marketing/banners" element={<MarketingBanners />} />
              <Route path="admin/marketing/logo" element={<MarketingLogo />} />
              <Route path="admin/compliance" element={<AdminKycApproval />} />
              <Route path="admin/recharges" element={<AdminRecharges />} />
              <Route path="admin/products" element={<AdminProducts />} />
              <Route path="admin/support" element={<AdminSupport />} />
              <Route path="admin/support/open" element={<Navigate to="/admin/support" />} />
              <Route path="admin/support/resolved" element={<Navigate to="/admin/support" />} />
              <Route path="admin/sales/overview" element={<ComingSoon />} />
              <Route path="admin/sales/gateway" element={<ComingSoon />} />
              <Route path="admin/sales/product" element={<ComingSoon />} />
              <Route path="admin/sales/service" element={<ComingSoon />} />
              <Route path="admin/sales/hierarchy" element={<ComingSoon />} />
              <Route path="admin/hierarchy" element={<AdminHierarchy />} />
              <Route path="admin/services" element={<AdminServices />} />
              <Route path="admin/service-nodes" element={<AdminServiceNodes />} />
              <Route path="admin/api-gateway/config" element={<ComingSoon />} />
              <Route path="admin/api-gateway/keys" element={<ComingSoon />} />
              <Route path="admin/settings" element={<AdminSettings />} />
              <Route path="admin/settings/team" element={<ComingSoon />} />
              <Route path="admin/settings/company" element={<ComingSoon />} />
              <Route path="admin/settings/approvals" element={<ComingSoon />} />
              <Route path="admin/audit-logs" element={<AdminAuditLogs />} />
            </>
          ) : null}

          {/* Partner Routes */}
          {user?.role === 'PARTNER' ? (
            <>
              <Route path="partner/dashboard" element={<PartnerDashboard />} />
              <Route path="partner/wallet" element={<PartnerWallet />} />
              <Route path="partner/transactions" element={<MyLedger />} />
              <Route path="partner/services" element={<Services />} />
              <Route path="partner/invoices" element={<Invoices />} />
              <Route path="partner/commission" element={<ComingSoon />} />
              <Route path="partner/customers" element={<PartnerCustomers />} />
              <Route path="partner/hierarchy" element={<PartnerHierarchy />} />
              <Route path="partner/transfer" element={<PartnerWallet />} />
              <Route path="partner/kyc" element={<PartnerKyc />} />
              <Route path="partner/customer-kyc" element={<PartnerCustomerKyc />} />
              <Route path="partner/support" element={<PartnerSupport />} />
              <Route path="partner/settings" element={<PartnerSettings />} />
            </>
          ) : null}

          {/* User Routes */}
          {user?.role === 'USER' ? (
            <>
              <Route path="user/dashboard" element={<CustomerDashboard />} />
              <Route path="user/wallet" element={<UserWallet />} />
              <Route path="user/transfers" element={<UserTransfers />} />
              <Route path="user/transactions" element={<UserTransactions />} />
              <Route path="user/bills" element={<ComingSoon />} />
              <Route path="user/services" element={<Services />} />
              <Route path="user/invoices" element={<Invoices />} />
              <Route path="user/kyc" element={<UserKyc />} />
              <Route path="user/support" element={<CustomerSupport />} />
              <Route path="user/profile" element={<ComingSoon />} />
            </>
          ) : null}
          
        </Route>
        
        <Route path="*" element={<Navigate to="/user/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
