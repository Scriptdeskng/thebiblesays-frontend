'use client';

import { useState, useEffect } from 'react';
import { StatsCard, LoadingSpinner, StatsCard2 } from '@/components/admin/ui';
import { apiService, mockProducts, mockOrders } from '@/services/mock.service';
import { formatCurrency, getStatusColor, calculatePercentage } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardStats, SalesData } from '@/types/admin.types';
import { BsCalendar2Fill, BsFillBagHeartFill } from 'react-icons/bs';
import { RiTShirtFill } from 'react-icons/ri';
import { FaPalette } from 'react-icons/fa';
import { HiUsers } from 'react-icons/hi2';
import { DonutChart } from '@/components/admin/ui/DonutChart';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('monthly');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, salesChartData] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getSalesData(),
      ]);
      setStats(statsData);
      setSalesData(salesChartData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const completedOrders = mockOrders.filter(o => o.status === 'delivered').length;
  const pendingOrders = mockOrders.filter(o => o.status === 'pending').length;
  const processingOrders = mockOrders.filter(o => o.status === 'processing').length;
  const totalOrders = mockOrders.length;

  const orderSummary = [
    { name: 'Completed', value: calculatePercentage(completedOrders, totalOrders), color: '#10b981' },
    { name: 'Pending', value: calculatePercentage(pendingOrders, totalOrders), color: '#3b82f6' },
    { name: 'Processing', value: calculatePercentage(processingOrders, totalOrders), color: '#f97316' },
  ];

  const bestSellers = [...mockProducts]
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium text-admin-primary mb-1 lg:text-2xl">Dashboard Overview</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button className="flex items-center space-x-2 px-4 py-2 bg-accent-3 rounded-lg text-sm transition-all text-admin-primary/90">
            <BsCalendar2Fill size={16} />
            <span>Jan 2025 - Dec 2025</span>
          </button>
          <button
            onClick={() => setDateFilter('today')}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${dateFilter === 'today' ? 'bg-admin-primary text-white' : 'bg-accent-3 text-admin-primary hover:bg-accent-2'
              }`}
          >
            Today
          </button>
          <button
            onClick={() => setDateFilter('weekly')}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${dateFilter === 'weekly' ? 'bg-admin-primary text-white' : 'bg-accent-3 text-admin-primary hover:bg-accent-2'
              }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setDateFilter('monthly')}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${dateFilter === 'monthly' ? 'bg-admin-primary text-white' : 'bg-accent-3 text-admin-primary hover:bg-accent-2'
              }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            icon={RiTShirtFill}
            title="Total Sales"
            value={formatCurrency(stats.totalSales)}
            change={stats.totalSalesChange}
            iconBgColor="bg-white"
            iconColor="text-admin-primary/25"
          />
          <StatsCard
            icon={BsFillBagHeartFill}
            title="Total Orders"
            value={stats.totalOrders}
            change={stats.totalOrdersChange}
            iconBgColor="bg-white"
            iconColor="text-admin-primary/25"
          />
          <StatsCard2
            icon={FaPalette}
            title="Custom Merch"
            value={stats.customMerch}
            change={stats.customMerchChange}
            iconBgColor="bg-white"
            iconColor="text-admin-primary/25"
          />
          <StatsCard
            icon={HiUsers}
            title="Users Registered"
            value={stats.usersRegistered}
            change={stats.usersRegisteredChange}
            iconBgColor="bg-white"
            iconColor="text-admin-primary/25"
          />
        </div>
      )}

      <div className='mt-10'>
        <h2 className="text-xl font-medium text-admin-primary mb-4 lg:text-2xl">Sales Overview</h2>
        <div className="bg-admin-primary/4 rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-sm text-admin-primary/60 mb-1">Total sales</h2>
              <p className="text-2xl font-bold text-admin-primary">
                {formatCurrency(salesData.reduce((sum, item) => sum + item.amount, 0))}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <span className="text-sm text-grey">Jan 2025 - Dec 2025</span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E9E9EB" />
              <XAxis
                dataKey="month"
                stroke="#5C5F6A"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#5C5F6A"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `₦${value / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E9E9EB',
                  borderRadius: '8px',
                }}
                formatter={(value: any) => [formatCurrency(value), 'Sales']}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#0E1422"
                strokeWidth={2}
                dot={{ fill: '#0E1422', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
        <div>
          <h2 className="text-xl font-medium text-admin-primary mb-4 lg:text-2xl">Best Selling Products</h2>
          <div className="bg-admin-primary/4 rounded-xl">
            <div className="overflow-x-auto p-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-accent-2">
                    <th className="text-left font-medium text-admin-primary pb-3">Product</th>
                    <th className="text-left font-medium text-admin-primary pb-3">Sales</th>
                    <th className="text-left font-medium text-admin-primary pb-3">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {bestSellers.map((product) => (
                    <tr key={product.id} className="border-b border-accent-2 last:border-0">
                      <td className="py-4">
                        <p className=" text-admin-primary">{product.name}</p>
                      </td>
                      <td className="py-4 text-admin-primary">{product.sales}</td>
                      <td className="py-4 text-[#2AA31F]">
                        {formatCurrency(product.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-medium text-admin-primary mb-4 lg:text-2xl">Order Summary</h2>
          <div className="bg-admin-primary/4 rounded-xl p-6">
            <div className="flex items-center justify-center py-8">
              <div className="w-48 h-48 relative">
                <DonutChart data={orderSummary} size={192} strokeWidth={24} />
              </div>
            </div>

            <div className="mt-10 flex items-center justify-between w-full">
              {orderSummary.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-grey">{item.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
