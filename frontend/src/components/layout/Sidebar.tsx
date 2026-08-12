import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import type { RootState } from '../../store/store';
import { logout } from '../../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Home, Wallet, Settings, LayoutDashboard, 
  Users, Briefcase, FileText, BarChart3, CreditCard, 
  MessageSquare, ShieldCheck, Mail, Globe, Receipt, Package,
  ChevronDown, ChevronRight
} from 'lucide-react';

interface SubMenuItem {
  name: string;
  path: string;
}

interface MenuItem {
  name: string;
  icon?: any;
  path?: string;
  subItems?: SubMenuItem[];
  isGroupLabel?: boolean;
}

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  const [expandedItems, setExpandedItems] = React.useState<Record<string, boolean>>({});

  const toggleExpand = (name: string) => {
    setExpandedItems(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/user/login');
  };

  const getMenuItems = () => {
    const role = user?.role;
    
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      const base = '/admin';
      return [
        { name: 'DASHBOARD & TRANSACTIONS', isGroupLabel: true },
        { name: 'Dashboard', icon: LayoutDashboard, path: `${base}/dashboard` },
        { 
          name: 'Transactions', 
          icon: BarChart3, 
          subItems: [
            { name: 'All Transactions', path: `${base}/transactions` },
            { name: 'Pending Approvals', path: `${base}/transactions/pending` },
            { name: 'Payouts', path: `${base}/transactions/payouts` },
            { name: 'Payment Gateway Transactions', path: `${base}/transactions/gateway` },
            { name: 'Failed Transactions', path: `${base}/transactions/failed` },
            { name: 'T+1 Settlement (Held Payments)', path: `${base}/transactions/settlement` },
          ]
        },
        {
          name: 'Support',
          icon: MessageSquare,
          subItems: [
            { name: 'Open Tickets', path: `${base}/support/open` },
            { name: 'Resolved Tickets', path: `${base}/support/resolved` },
          ]
        },
        { name: 'FINANCE & ACCOUNTING', isGroupLabel: true },
        {
          name: 'Wallets & Accounts',
          icon: Wallet,
          subItems: [
            { name: 'System Ledger', path: `${base}/system-ledger` },
            { name: 'Partner Ledger', path: `${base}/partner-ledger` },
            { name: 'Wallet Recharge Requests', path: `${base}/wallet-requests` },
            { name: 'Wallet Transfers', path: `${base}/wallet-transfers` },
            { name: 'Invoices', path: `${base}/invoices` },
            { name: 'Purchase Records', path: `${base}/purchase-records` }
          ]
        },
        {
          name: 'Sales Reports',
          icon: FileText,
          subItems: [
            { name: 'Sales Overview', path: `${base}/sales/overview` },
            { name: 'Sales by Payment Gateway', path: `${base}/sales/gateway` },
            { name: 'Sales by Product', path: `${base}/sales/product` },
            { name: 'Sales by Service', path: `${base}/sales/service` },
            { name: 'Sales Hierarchy Report', path: `${base}/sales/hierarchy` }
          ]
        },
        { name: 'PARTNERS & PRODUCTS', isGroupLabel: true },
        {
          name: 'Customer Management',
          icon: Users,
          subItems: [
            { name: 'Customer List', path: `${base}/customers` },
            { name: 'Margin Settings', path: `${base}/margin-settings` },
            { name: 'Bank Accounts', path: `${base}/bank-accounts` },
            { name: 'Settlement Accounts', path: `${base}/settlement-accounts` },
            { name: 'Hierarchy Directory', path: `${base}/hierarchy` }
          ]
        },
        {
          name: 'Products & Services',
          icon: Package,
          subItems: [
            { name: 'Product List', path: `${base}/products` },
            { name: 'Services', path: `${base}/services` },
            { name: 'Service Nodes', path: `${base}/service-nodes` }
          ]
        },
        { name: 'TECHNICAL & MARKETING', isGroupLabel: true },
        {
          name: 'API Gateway',
          icon: Globe,
          subItems: [
            { name: 'Gateway Configuration', path: `${base}/api-gateway/config` },
            { name: 'API Keys', path: `${base}/api-gateway/keys` }
          ]
        },
        { 
          name: 'Marketing', 
          icon: BarChart3,
          subItems: [
            { name: 'WhatsApp', path: `${base}/marketing/whatsapp` },
            { name: 'SMS', path: `${base}/marketing/sms` },
            { name: 'Email', path: `${base}/marketing/email` },
            { name: 'News', path: `${base}/marketing/news` },
            { name: 'Banners', path: `${base}/marketing/banners` },
            { name: 'Logo', path: `${base}/marketing/logo` }
          ]
        },
        { 
          name: 'Settings & Control', 
          icon: Settings,
          subItems: [
            { name: 'Team Members', path: `${base}/settings/team` },
            { name: 'Company Settings', path: `${base}/settings/company` },
            { name: 'Document Approvals', path: `${base}/settings/approvals` }
          ]
        },
        { name: 'Compliance', icon: ShieldCheck, path: `${base}/compliance` },
        { name: 'Audit Logs', path: `${base}/audit-logs`, icon: ShieldCheck },
      ];
    }
    
    if (role === 'PARTNER') {
      const base = '/partner';
      return [
        { name: 'Overview', icon: LayoutDashboard, path: `${base}/dashboard` },
        { name: 'Wallet', icon: Wallet, path: `${base}/wallet` },
        { name: 'Transactions', icon: BarChart3, path: `${base}/transactions` },
        { name: 'Commission', icon: Receipt, path: `${base}/commission` },
        { name: 'Customers', icon: Users, path: `${base}/customers` },
        { name: 'Recharge & Transfer', icon: CreditCard, path: `${base}/transfer` },
        { name: 'Services', icon: Package, path: `${base}/services` },
        { name: 'Invoices', icon: FileText, path: `${base}/invoices` },
        { name: 'My KYC', icon: ShieldCheck, path: `${base}/kyc` },
        { name: 'Customer KYC', icon: ShieldCheck, path: `${base}/customer-kyc` },
        { name: 'Support', icon: MessageSquare, path: `${base}/support` },
        { name: 'Profile/Settings', icon: Settings, path: `${base}/settings` },
      ];
    }
    
    // Default to USER
    const base = '/user';
    return [
      { name: 'Dashboard', icon: Home, path: `${base}/dashboard` },
      { name: 'Wallet', icon: Wallet, path: `${base}/wallet` },
      { name: 'Add/Send Money', icon: CreditCard, path: `${base}/transfers` },
      { name: 'Transactions', icon: BarChart3, path: `${base}/transactions` },
      { name: 'Bills/Services', icon: Globe, path: `${base}/bills` },
      { name: 'Services', icon: Package, path: `${base}/services` },
      { name: 'Invoices', icon: FileText, path: `${base}/invoices` },
      { name: 'KYC', icon: ShieldCheck, path: `${base}/kyc` },
      { name: 'Support', icon: MessageSquare, path: `${base}/support` },
      { name: 'Profile', icon: Settings, path: `${base}/profile` },
    ];
  };

  const menuItems = getMenuItems();

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-screen sticky top-0 shadow-xl overflow-y-auto hidden md:flex">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-extrabold text-blue-400 tracking-tight">NexBank Platform</h1>
        <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">{user?.role} PORTAL</p>
      </div>
      
      <nav className="flex-1 mt-6">
        <ul className="space-y-1 px-3">
          {menuItems.map((item, idx) => {
            if (item.isGroupLabel) {
              return (
                <li key={`group-${idx}`} className="px-4 pt-4 pb-2 mt-2">
                  <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">{item.name}</span>
                </li>
              );
            }

            const isExpanded = expandedItems[item.name];
            const hasSubItems = item.subItems && item.subItems.length > 0;
            
            // Check if any sub-item is active
            const isSubItemActive = hasSubItems && item.subItems!.some(sub => {
              if (location.pathname === sub.path) return true;
              if (sub.path === '/admin/customers' && location.pathname.startsWith('/admin/user/')) return true;
              return false;
            });
            
            const isActive = !hasSubItems && item.path ? location.pathname.includes(item.path) : isSubItemActive;

            return (
              <li key={item.name} className="mb-1">
                {hasSubItems ? (
                  <div>
                    <button
                      onClick={() => toggleExpand(item.name)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md' 
                          : isExpanded
                            ? 'bg-gray-800/80 text-white'
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center">
                        {item.icon && <item.icon className={`h-5 w-5 mr-3 transition-colors ${isActive || isExpanded ? 'text-white' : 'text-gray-400 group-hover:text-blue-400'}`} />}
                        <span className="font-medium text-sm">{item.name}</span>
                      </div>
                      {isExpanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
                    </button>
                    {isExpanded && (
                      <ul className="mt-2 space-y-1 relative before:absolute before:inset-y-0 before:left-6 before:w-0.5 before:bg-gray-700">
                        {item.subItems!.map(sub => {
                          const isSubActive = location.pathname === sub.path || (sub.path === '/admin/customers' && location.pathname.startsWith('/admin/user/'));
                          return (
                            <li key={sub.name} className="relative">
                              <Link
                                to={sub.path}
                                className={`flex items-center pl-10 pr-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                                  isSubActive 
                                    ? 'text-blue-400 font-semibold' 
                                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                                }`}
                              >
                                {isSubActive && (
                                  <div className="absolute left-6 w-0.5 h-full bg-blue-500 rounded-full"></div>
                                )}
                                {sub.name}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path!}
                    className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    {item.icon && <item.icon className={`h-5 w-5 mr-3 transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-400'}`} />}
                    <span className="font-medium text-sm">{item.name}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-400 hover:bg-gray-800 hover:text-red-300 rounded-lg transition-colors group"
        >
          <LogOut className="h-5 w-5 mr-3 text-red-500 group-hover:text-red-400 transition-colors" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
