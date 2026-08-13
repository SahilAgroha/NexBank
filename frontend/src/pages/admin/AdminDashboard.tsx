import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store/store';
import { fetchDashboardStats } from '../../features/admin/adminSlice';
import { 
  Wallet, ShoppingCart, Users, CreditCard, 
  CheckCircle, Clock, XCircle, RotateCcw, Filter
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const AdminDashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stats, loading } = useSelector((state: RootState) => state.admin);

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const handleFilter = () => {
    dispatch(fetchDashboardStats({ 
      startDate: startDate || undefined, 
      endDate: endDate || undefined 
    }));
  };

  useEffect(() => {
    handleFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading || !stats) {
    return <div className="flex h-full items-center justify-center"><p className="text-gray-500">Loading dashboard...</p></div>;
  }

  const formatCurrency = (val: number | undefined) => {
    return `₹${(val || 0).toFixed(2)}`;
  };

  const getStatusData = (statusStr: string) => {
    const metric = stats.transactionStats?.find(s => s.status === statusStr);
    return {
      amount: metric?.amount || 0,
      count: metric?.count || 0
    };
  };

  const successData = getStatusData('SUCCESS');
  const pendingData = getStatusData('PENDING');
  const failedData = getStatusData('FAILED');
  const refundData = getStatusData('REFUND');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header / Date Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center">
            <span className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center mr-3 text-lg">📊</span>
            Dashboard Overview
          </h1>
          <p className="text-xs text-gray-500 mt-1">Real-time metrics and performance analytics</p>
        </div>
        <div className="flex items-center space-x-2">
          <input 
            type="date" 
            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <span className="text-gray-400">-</span>
          <input 
            type="date" 
            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <button 
            onClick={handleFilter}
            className="bg-[#1e293b] text-white px-4 py-1.5 rounded flex items-center text-sm hover:bg-[#334155] transition-colors"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="COMPANY WALLET" 
          subtitle="Available Balance" 
          value={formatCurrency(stats.systemBalance)} 
          icon={<Wallet className="w-6 h-6 text-white" />} 
          iconBg="bg-blue-500"
        />
        <MetricCard 
          title="PURCHASE" 
          subtitle="Total Purchased" 
          value={formatCurrency(stats.totalPurchased)} 
          icon={<ShoppingCart className="w-6 h-6 text-white" />} 
          iconBg="bg-teal-400"
        />
        <MetricCard 
          title="TOTAL CUSTOMERS" 
          subtitle="Active Users" 
          value={stats.totalUsers} 
          icon={<Users className="w-6 h-6 text-white" />} 
          iconBg="bg-amber-500"
        />
        <MetricCard 
          title="CUSTOMER WALLET" 
          subtitle="Aggregate Balance" 
          value={formatCurrency(stats.totalCustomerWalletBalance)} 
          icon={<CreditCard className="w-6 h-6 text-white" />} 
          iconBg="bg-emerald-500"
        />
      </div>

      {/* Commission and Transactions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Commission & Profit */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="bg-[#1e293b] text-white px-4 py-3 font-medium text-sm">
            Commission & Profit
          </div>
          <div className="p-5 flex-1 flex flex-col justify-center space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <span className="text-gray-600 text-sm font-medium">Commission IN</span>
              <span className="text-emerald-500 font-semibold">{formatCurrency(stats.commissionIn)}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <span className="text-gray-600 text-sm font-medium">Commission OUT</span>
              <span className="text-rose-500 font-semibold">{formatCurrency(stats.commissionOut)}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-600 text-sm font-medium uppercase">Net Profit</span>
              <span className="text-blue-600 text-2xl font-bold">{formatCurrency(stats.netProfit)}</span>
            </div>
          </div>
        </div>

        {/* Transaction Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <TxStatCard 
            title="SUCCESS" 
            amount={successData.amount} 
            count={successData.count} 
            icon={<CheckCircle className="w-8 h-8 text-emerald-500" />} 
          />
          <TxStatCard 
            title="PENDING" 
            amount={pendingData.amount} 
            count={pendingData.count} 
            icon={<Clock className="w-8 h-8 text-gray-800" />} 
          />
          <TxStatCard 
            title="FAILED" 
            amount={failedData.amount} 
            count={failedData.count} 
            icon={<XCircle className="w-8 h-8 text-rose-500" />} 
          />
          <TxStatCard 
            title="REFUND" 
            amount={refundData.amount} 
            count={refundData.count} 
            icon={<RotateCcw className="w-8 h-8 text-blue-500" />} 
          />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <h2 className="text-gray-800 font-bold mb-4">Sales Trend</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <h2 className="text-gray-800 font-bold mb-4">Top Products</h2>
          <div className="h-64 flex justify-center items-center">
            {stats.topProducts && stats.topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.topProducts}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {stats.topProducts.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-sm">No product data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, subtitle, value, icon, iconBg }: any) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 flex items-center space-x-4">
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconBg}`}>
      {icon}
    </div>
    <div>
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</h3>
      <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
    </div>
  </div>
);

const TxStatCard = ({ title, amount, count, icon }: any) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 flex flex-col items-center justify-center text-center space-y-3">
    {icon}
    <div>
      <h3 className="text-xs font-bold text-gray-500 uppercase">{title}</h3>
      <p className="text-lg font-bold text-gray-900 mt-1">₹{amount.toFixed(2)}</p>
      <p className="text-xs text-gray-400 mt-0.5">{count} txns</p>
    </div>
  </div>
);

export default AdminDashboard;
