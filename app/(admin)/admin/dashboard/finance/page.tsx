'use client';

import { useState, useEffect } from 'react';
import { Search, Eye, Download, DollarSign, TrendingUp, ArrowLeft, Calendar, ChevronDown } from 'lucide-react';
import { Button, Modal, Badge, LoadingSpinner, StatsCard, Textarea, StatsCard2 } from '@/components/admin/ui';
import { Transaction, Settlement } from '@/types/admin.types';
import { mockTransactions, mockSettlements, apiService } from '@/services/api.service';
import { formatCurrency, formatDateTime, formatDate } from '@/lib/utils';
import { TbMoneybag } from 'react-icons/tb';
import { LuCalendarRange } from 'react-icons/lu';
import { BsCalendar3 } from 'react-icons/bs';

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<'transactions' | 'settlements' | 'revenue'>('transactions');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [durationFilter, setDurationFilter] = useState<string>('monthly');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [tempStatus, setTempStatus] = useState<string>('pending');
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [revenueDateFilter, setRevenueDateFilter] = useState<string>('monthly');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [transactionsData] = await Promise.all([
        apiService.getTransactions(),
      ]);
      setTransactions(transactionsData);
      setSettlements(mockSettlements);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setTempStatus(transaction.status);
    setShowTransactionDetails(true);
  };

  const handleBackToList = () => {
    setShowTransactionDetails(false);
    setSelectedTransaction(null);
    setRefundReason('');
  };

  const handleProcessRefund = () => {
    if (!refundReason.trim()) {
      alert('Please provide a reason for the refund');
      return;
    }
    alert('Refund processed successfully!');
    setRefundReason('');
    setShowRefundModal(false);
    handleBackToList();
  };

  const handleSaveChanges = () => {
    alert('Changes saved successfully!');
    handleBackToList();
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.userName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    const matchesPayment = paymentMethodFilter === 'all' || transaction.method === paymentMethodFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const todayRevenue = 485000;
  const weekRevenue = 3250000;
  const monthRevenue = 12800000;
  const pendingPayouts = 985000;

  const totalRevenue = transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0);
  const taxCollected = totalRevenue * 0.075;
  const gatewayFees = settlements.reduce((sum, s) => sum + s.gatewayFee, 0);
  const netAfterFees = totalRevenue - gatewayFees;

  const getDateFilterDisplay = () => {
    const now = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    switch(revenueDateFilter) {
      case 'today':
        return `${now.getDate()} ${monthNames[now.getMonth()]} ${now.getFullYear()}`;
      case 'weekly':
        return 'Week 1 - Week 5';
      case 'monthly':
        return `${monthNames[0]} ${now.getFullYear()} - ${monthNames[11]} ${now.getFullYear()}`;
      case 'yearly':
        return `${now.getFullYear() - 5} - ${now.getFullYear()}`;
      default:
        return `${monthNames[0]} ${now.getFullYear()} - ${monthNames[11]} ${now.getFullYear()}`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      {!showTransactionDetails && (
        <>
          <div className='mb-6'>
            <h1 className="text-xl lg:text-2xl font-bold text-admin-primary">Finance Management</h1>
            <p className="text-sm text-admin-primary">Monitor transactions, settlements and revenue insights</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatsCard icon={TbMoneybag} title="Today's Revenue" value={formatCurrency(todayRevenue)} change={12.5} iconBgColor="bg-white" iconColor="text-[#626262]" />
            <StatsCard icon={LuCalendarRange} title="This Week" value={formatCurrency(weekRevenue)} change={8.3} iconBgColor="bg-white" iconColor="text-[#626262]" />
            <StatsCard2 icon={BsCalendar3} title="This Month" value={formatCurrency(monthRevenue)} change={15.7} iconBgColor="bg-white" iconColor="text-[#626262]" />
          </div>
        </>
      )}

      {showTransactionDetails && selectedTransaction ? (
        <div className="bg-white rounded-xl p-6">
          <div className="flex items-center gap-5 mb-6">
            <button
              onClick={handleBackToList}
              className="flex items-center space-x-2 text-admin-primary hover:text-admin-primary/80 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="font-medium text-admin-primary">Transaction Details</h2>
          </div>

          <div className="space-y-6 bg-admin-primary/4 p-6 rounded-lg">
            <div>
              <h3 className="font-semibold text-admin-primary mb-3">Personal Information</h3>
              <div className="space-y-4 text-sm">
                <div className='flex items-center justify-between'>
                  <p className="text-grey mb-1">Name</p>
                  <p className="text-admin-primary font-medium">{selectedTransaction.userName}</p>
                </div>
                <div className='flex items-center justify-between'>
                  <p className="text-grey mb-1">Email</p>
                  <p className="text-admin-primary font-medium">{selectedTransaction.userEmail || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-admin-primary mb-3">Transaction Information</h3>
              <div className="space-y-4 text-sm bg-admin-primary/8 p-2 rounded-md">
                <div className='flex items-center justify-between'>
                  <p className="text-grey mb-1">Transaction ID</p>
                  <p className="text-admin-primary font-medium">{selectedTransaction.id}</p>
                </div>
                <div className='flex items-center justify-between'>
                  <p className="text-grey mb-1">Transaction Date</p>
                  <p className="text-admin-primary font-medium">{formatDateTime(selectedTransaction.dateTime)}</p>
                </div>
                <div className='flex items-center justify-between'>
                  <p className="text-grey mb-1">Method</p>
                  <p className="text-admin-primary font-medium capitalize">{selectedTransaction.method}</p>
                </div>
                <div className='flex items-center justify-between'>
                  <p className="text-grey mb-1">Amount</p>
                  <p className="text-admin-primary font-medium">{formatCurrency(selectedTransaction.amount)}</p>
                </div>
                <div className='flex items-center justify-between'>
                  <p className="text-grey mb-1">Payment Status</p>
                  <Badge variant={
                    selectedTransaction.status === 'completed' ? 'success' :
                    selectedTransaction.status === 'pending' ? 'warning' :
                    selectedTransaction.status === 'failed' ? 'danger' : 'default'
                  }>
                    {selectedTransaction.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-admin-primary mb-3">Change Status</h3>
              <div className="flex flex-wrap gap-3">
                {['pending', 'completed', 'cancelled', 'shipped', 'refund'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => {
                      if (status === 'refund') {
                        setShowRefundModal(true);
                      } else {
                        setTempStatus(status);
                      }
                    }}
                    className={`px-5 py-1.5 rounded-md border transition-all capitalize ${tempStatus === status
                      ? 'border-[#A1CBFF] text-[#3291FF] bg-secondary'
                      : 'border-admin-primary/35 text-admin-primary'
                      }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-center space-x-5 pt-5">
              <Button type="button" variant="secondary" onClick={handleBackToList}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSaveChanges}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-admin-primary/4 rounded-t-xl p-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2 bg-white p-1">
                <button
                  onClick={() => setActiveTab('transactions')}
                  className={`px-4 py-2 rounded-sm text-sm transition-all ${activeTab === 'transactions'
                    ? 'bg-admin-primary text-white'
                    : 'bg-admin-primary/5 text-admin-primary'
                    }`}
                >
                  Transactions
                </button>
                <button
                  onClick={() => setActiveTab('settlements')}
                  className={`px-4 py-2 rounded-sm text-sm transition-all ${activeTab === 'settlements'
                    ? 'bg-admin-primary text-white'
                    : 'bg-admin-primary/5 text-admin-primary'
                    }`}
                >
                  Settlements
                </button>
                <button
                  onClick={() => setActiveTab('revenue')}
                  className={`px-4 py-2 rounded-sm text-sm transition-all ${activeTab === 'revenue'
                    ? 'bg-admin-primary text-white'
                    : 'bg-admin-primary/5 text-admin-primary'
                    }`}
                >
                  Revenue
                </button>
              </div>
              <Button>
                Export
              </Button>
            </div>
          </div>

          {activeTab === 'transactions' && (
            <>
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between bg-admin-primary/4 p-6 gap-4'>
                <div>
                  <h2 className="text-sm text-admin-primary/60 mb-1">All Transactions</h2>
                  <p className="text-2xl font-bold text-admin-primary">{filteredTransactions.length}</p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-grey" size={20} />
                    <input
                      type="text"
                      placeholder="Search transactions"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white rounded-lg focus:outline-none sm:w-100 lg:w-150"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 bg-white rounded-lg focus:outline-none"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                  <select
                    value={paymentMethodFilter}
                    onChange={(e) => setPaymentMethodFilter(e.target.value)}
                    className="px-4 py-2 bg-white rounded-lg focus:outline-none"
                  >
                    <option value="all">All Methods</option>
                    <option value="paystack">Paystack</option>
                    <option value="flutterwave">Flutterwave</option>
                  </select>
                  <select
                    value={durationFilter}
                    onChange={(e) => setDurationFilter(e.target.value)}
                    className="px-4 py-2 bg-white rounded-lg focus:outline-none flex items-center"
                  >
                    <option value="today">Today</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="bg-admin-primary/4 rounded-b-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-accent-1 shadow-md shadow-black">
                      <tr>
                        <th className="text-left font-medium text-admin-primary px-6 py-4">Transaction ID</th>
                        <th className="text-left font-medium text-admin-primary px-6 py-4">User</th>
                        <th className="text-left font-medium text-admin-primary px-6 py-4">Amount</th>
                        <th className="text-left font-medium text-admin-primary px-6 py-4">Method</th>
                        <th className="text-left font-medium text-admin-primary px-6 py-4">Date & Time</th>
                        <th className="text-left font-medium text-admin-primary px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((transaction) => (
                        <tr
                          key={transaction.id}
                          onClick={() => handleViewTransaction(transaction)}
                          className="border-b border-accent-2 transition-colors bg-white cursor-pointer"
                        >
                          <td className="px-6 py-4 text-admin-primary">{transaction.id}</td>
                          <td className="px-6 py-4 text-admin-primary">{transaction.userName}</td>
                          <td className="px-6 py-4 text-admin-primary">{formatCurrency(transaction.amount)}</td>
                          <td className="px-6 py-4 text-admin-primary capitalize">{transaction.method}</td>
                          <td className="px-6 py-4 text-admin-primary">{formatDateTime(transaction.dateTime)}</td>
                          <td className="px-6 py-4">
                            <Badge variant={
                              transaction.status === 'completed' ? 'success' :
                              transaction.status === 'pending' ? 'warning' :
                              transaction.status === 'failed' ? 'danger' : 'default'
                            }>
                              {transaction.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'settlements' && (
            <div className="bg-admin-primary/4 rounded-b-xl p-6">
              <div className="space-y-4">
                {settlements.map((settlement) => (
                  <div key={settlement.id} className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-semibold text-admin-primary capitalize">{settlement.gateway}</span>
                      <Badge variant="success">Settled</Badge>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-grey mb-1">Gross Amount</p>
                        <p className="text-lg font-semibold text-admin-primary">{formatCurrency(settlement.grossAmount)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-grey mb-1">Gateway Fee</p>
                        <p className="text-lg font-semibold text-red-600">-{formatCurrency(settlement.gatewayFee)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-grey mb-1">Net Payout</p>
                        <p className="text-lg font-semibold text-green-600">{formatCurrency(settlement.netPayout)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-grey mb-1">Settlement Date</p>
                        <p className="text-lg font-semibold text-admin-primary">{formatDate(settlement.settlementDate)}</p>
                      </div>
                    </div>

                    <Button variant="ghost" size="sm" className='flex flex-row items-center'>
                      <Download size={14} className="mr-2" />
                      Download Report
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'revenue' && (
            <>
              <div className='flex items-center justify-between bg-admin-primary/4 p-6'>
                <h2 className="text-lg font-semibold text-admin-primary">Revenue Overview</h2>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg border border-admin-primary/35">
                    <Calendar size={18} className="text-admin-primary" />
                    <span className="text-admin-primary text-sm">{getDateFilterDisplay()}</span>
                  </div>
                  <select
                    value={revenueDateFilter}
                    onChange={(e) => setRevenueDateFilter(e.target.value)}
                    className="px-4 py-2 bg-white rounded-lg focus:outline-none border border-admin-primary/35"
                  >
                    <option value="today">Today</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="bg-admin-primary/4 rounded-b-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatsCard 
                    icon={TbMoneybag} 
                    title="Total Revenue" 
                    value={formatCurrency(totalRevenue)} 
                    change={12.5} 
                    iconBgColor="bg-white" 
                    iconColor="text-[#626262]" 
                  />
                  <StatsCard2 
                    icon={TrendingUp} 
                    title="Tax Collected" 
                    value={formatCurrency(taxCollected)} 
                    change={8.3} 
                    iconBgColor="bg-white" 
                    iconColor="text-[#626262]" 
                  />
                  <StatsCard 
                    icon={DollarSign} 
                    title="Net After Fees" 
                    value={formatCurrency(netAfterFees)} 
                    change={15.7} 
                    iconBgColor="bg-white" 
                    iconColor="text-[#626262]" 
                  />
                </div>
              </div>
            </>
          )}
        </>
      )}

      <Modal
        isOpen={showRefundModal}
        onClose={() => setShowRefundModal(false)}
        title="Process Refund"
        size="sm"
      >
        {selectedTransaction && (
          <div className="space-y-4">
            <div className="space-y-4 text-sm p-4 bg-accent-1 rounded-lg">
              <div className='flex items-center justify-between'>
                <p className="text-grey mb-1">Transaction ID</p>
                <p className="text-admin-primary font-medium">{selectedTransaction.id}</p>
              </div>
              <div className='flex items-center justify-between'>
                <p className="text-grey mb-1">User</p>
                <p className="text-admin-primary font-medium">{selectedTransaction.userName}</p>
              </div>
              <div className='flex items-center justify-between'>
                <p className="text-grey mb-1">Amount</p>
                <p className="text-admin-primary font-medium">{formatCurrency(selectedTransaction.amount)}</p>
              </div>
            </div>

            <div>
              <label className="block text-admin-primary font-medium mb-2">Reason for Refund</label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Enter reason for processing this refund..."
                rows={4}
                className="w-full px-4 py-3 border border-admin-primary/35 rounded-lg focus:outline-none resize-none"
              />
            </div>

            <div className="flex justify-center space-x-5 pt-4">
              <Button type="button" variant="secondary" onClick={() => setShowRefundModal(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleProcessRefund}>
                Process Refund
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}