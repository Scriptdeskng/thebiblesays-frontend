"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  // Eye,
  Download,
  DollarSign,
  TrendingUp,
  // ArrowLeft,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import "react-day-picker/dist/style.css";
import {
  Button,
  Modal,
  Badge,
  LoadingSpinner,
  StatsCard,
  // Textarea,
  StatsCard2,
} from "@/components/admin/ui";
import {
  Transaction,
  Settlement,
  ApiTransaction,
  RevenueAnalytics,
} from "@/types/admin.types";
// import { mockSettlements } from "@/services/mock.service";
import { dashboardService } from "@/services/dashboard.service";
import { formatCompactCurrency, formatDateTime, formatDate } from "@/lib/utils";
import { TbMoneybag } from "react-icons/tb";
import { LuCalendarRange } from "react-icons/lu";
import { BsCalendar3 } from "react-icons/bs";
import toast from "react-hot-toast";

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<
    "transactions" | "settlements" | "revenue"
  >("transactions");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [revenueAnalytics, setRevenueAnalytics] =
    useState<RevenueAnalytics | null>(null);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all");
  const [durationFilter, setDurationFilter] = useState<string>("monthly");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [tempStatus, setTempStatus] = useState<string>("pending");
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [revenueDateFilter, setRevenueDateFilter] = useState<string>("monthly");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [exporting, setExporting] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [revenueDateRange, setRevenueDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Map API transaction to frontend Transaction type
  const mapApiTransactionToTransaction = (
    apiTx: ApiTransaction
  ): Transaction => {
    // Extract name from email (before @) or use fallback
    const userEmail = apiTx.user_email || "";
    const emailName = userEmail ? userEmail.split("@")[0] : "Unknown";
    const userName = emailName
      ? emailName.charAt(0).toUpperCase() + emailName.slice(1)
      : "Unknown User";

    // Normalize payment method
    const paymentMethod = (apiTx.payment_method || "").toLowerCase();
    const normalizedMethod: "paystack" | "nova" | "payaza" | "stripe" =
      paymentMethod === "paystack" ||
      paymentMethod === "nova" ||
      paymentMethod === "payaza" ||
      paymentMethod === "stripe"
        ? paymentMethod
        : "paystack"; // Default fallback

    // Normalize status: API uses 'successful', frontend uses 'successful'
    const apiStatus = (apiTx.status || "pending").toLowerCase();
    const normalizedStatus: "pending" | "successful" | "failed" =
      apiStatus === "pending" ||
      apiStatus === "successful" ||
      apiStatus === "failed"
        ? apiStatus
        : "pending"; // Default fallback

    return {
      id: apiTx.id?.toString() || "",
      userId: "", // API doesn't provide userId
      userName: userName,
      userEmail: userEmail,
      amount: parseFloat(apiTx.amount || "0"),
      method: normalizedMethod,
      status: normalizedStatus,
      dateTime: apiTx.created_at || new Date().toISOString(),
      refundReason: undefined,
    };
  };

  const loadData = useCallback(async () => {
    try {
      setTableLoading(true);
      const apiTransactions = await dashboardService.getTransactions({
        status: statusFilter !== "all" ? statusFilter : undefined,
        payment_method:
          paymentMethodFilter !== "all" ? paymentMethodFilter : undefined,
        date_filter: durationFilter,
      });
      // Map API transactions to frontend Transaction type
      const mappedTransactions = apiTransactions.map(
        mapApiTransactionToTransaction
      );
      setTransactions(mappedTransactions);
      setSettlements([]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setTableLoading(false);
    }
  }, [statusFilter, paymentMethodFilter, durationFilter]);

  const loadRevenueAnalytics = useCallback(async () => {
    try {
      setRevenueLoading(true);
      const params: {
        date_filter?: string;
        start_date?: string;
        end_date?: string;
      } = {};

      // If a custom date range is selected, use start_date and end_date
      if (revenueDateRange.from && revenueDateRange.to) {
        params.start_date = revenueDateRange.from.toISOString().split("T")[0]; // Format as YYYY-MM-DD
        params.end_date = revenueDateRange.to.toISOString().split("T")[0]; // Format as YYYY-MM-DD
      } else {
        // Otherwise, use the date filter
        params.date_filter = revenueDateFilter;
      }

      const analytics = await dashboardService.getRevenueAnalytics(params);
      setRevenueAnalytics(analytics);
    } catch (error) {
      console.error("Error loading revenue analytics:", error);
    } finally {
      setRevenueLoading(false);
    }
  }, [revenueDateFilter, revenueDateRange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (activeTab === "revenue") {
      loadRevenueAnalytics();
    }
  }, [activeTab, revenueDateFilter, loadRevenueAnalytics]);

  // Handle click outside to close date picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setIsDatePickerOpen(false);
      }
    };

    if (isDatePickerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDatePickerOpen]);

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setTempStatus(transaction.status);
    setShowTransactionDetails(true);
  };

  const handleBackToList = () => {
    setShowTransactionDetails(false);
    setSelectedTransaction(null);
    setRefundReason("");
  };

  const handleProcessRefund = () => {
    if (!refundReason.trim()) {
      alert("Please provide a reason for the refund");
      return;
    }
    alert("Refund processed successfully!");
    setRefundReason("");
    setShowRefundModal(false);
    handleBackToList();
  };

  const handleSaveChanges = () => {
    alert("Changes saved successfully!");
    handleBackToList();
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      // Map filters to API parameters
      let apiStatus: string | undefined;
      if (statusFilter !== "all") {
        apiStatus = statusFilter;
      }

      let apiPaymentMethod: string | undefined;
      if (paymentMethodFilter !== "all") {
        apiPaymentMethod = paymentMethodFilter;
      }

      const params: {
        search?: string;
        status?: string;
        payment_method?: string;
        date_filter?: string;
        start_date?: string;
        end_date?: string;
      } = {};

      if (searchQuery) {
        params.search = searchQuery;
      }
      if (apiStatus) {
        params.status = apiStatus;
      }
      if (apiPaymentMethod) {
        params.payment_method = apiPaymentMethod;
      }

      // If custom date range is selected, use start_date and end_date
      // Otherwise, use date_filter
      if (revenueDateRange.from && revenueDateRange.to) {
        params.start_date = revenueDateRange.from.toISOString().split("T")[0];
        params.end_date = revenueDateRange.to.toISOString().split("T")[0];
      } else {
        params.date_filter = durationFilter;
      }

      const blob = await dashboardService.exportTransactions(params);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `transactions-export-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Transactions exported successfully");
    } catch (error) {
      console.error("Error exporting transactions:", error);
      toast.error("Failed to export transactions");
    } finally {
      setExporting(false);
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.userName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || transaction.status === statusFilter;
    const matchesPayment =
      paymentMethodFilter === "all" ||
      transaction.method === paymentMethodFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    endIndex
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, paymentMethodFilter, durationFilter, searchQuery]);

  // Get revenue values from API or use defaults
  const totalRevenue = revenueAnalytics?.total_revenue
    ? parseFloat(String(revenueAnalytics.total_revenue))
    : transactions
        .filter((t) => t.status === "successful")
        .reduce((sum, t) => sum + t.amount, 0);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today);
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  const dailyRevenue = revenueAnalytics?.daily_revenue || [];

  const todayRevenue = dailyRevenue
    .filter((day: any) => {
      if (!day.date) return false;
      const dayDate = new Date(day.date);
      return dayDate >= today;
    })
    .reduce(
      (sum: number, day: any) => sum + parseFloat(String(day.revenue || 0)),
      0
    );

  const weekRevenue = dailyRevenue
    .filter((day: any) => {
      if (!day.date) return false;
      const dayDate = new Date(day.date);
      return dayDate >= weekAgo;
    })
    .reduce(
      (sum: number, day: any) => sum + parseFloat(String(day.revenue || 0)),
      0
    );

  const monthRevenue = dailyRevenue
    .filter((day: any) => {
      if (!day.date) return false;
      const dayDate = new Date(day.date);
      return dayDate >= monthAgo;
    })
    .reduce(
      (sum: number, day: any) => sum + parseFloat(String(day.revenue || 0)),
      0
    );

  const taxCollected = totalRevenue * 0.075;
  const gatewayFees = settlements.reduce((sum, s) => sum + s.gatewayFee, 0);
  const netAfterFees = totalRevenue === 0 ? 0 : totalRevenue - gatewayFees;

  return (
    <div>
      {!showTransactionDetails && (
        <>
          <div className="mb-6">
            <h1 className="text-xl lg:text-2xl font-bold text-admin-primary">
              Finance Management
            </h1>
            <p className="text-sm text-admin-primary">
              Monitor transactions, settlements and revenue insights
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatsCard
              icon={TbMoneybag}
              title="Today's Revenue"
              value={(todayRevenue)}
              change={12.5}
              iconBgColor="bg-white"
              iconColor="text-[#626262]"
            />
            <StatsCard
              icon={LuCalendarRange}
              title="This Week"
              value={formatCompactCurrency(weekRevenue)}
              change={8.3}
              iconBgColor="bg-white"
              iconColor="text-[#626262]"
            />
            <StatsCard2
              icon={BsCalendar3}
              title="This Month"
              value={formatCompactCurrency(monthRevenue)}
              change={15.7}
              iconBgColor="bg-white"
              iconColor="text-[#626262]"
            />
          </div>
        </>
      )}

      {showTransactionDetails && selectedTransaction ? (
        <div className="bg-white rounded-xl">
          <div className="flex items-center gap-5 mb-6">
            <button
              onClick={handleBackToList}
              className="flex items-center space-x-2 text-admin-primary hover:text-admin-primary/80 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="font-medium text-admin-primary">
              Transaction Details
            </h2>
          </div>

          <div className="space-y-6 bg-admin-primary/4 p-6 rounded-lg">
            <div>
              <h3 className="font-semibold text-admin-primary mb-3">
                Personal Information
              </h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <p className="text-grey mb-1">Name</p>
                  <p className="text-admin-primary font-medium">
                    {selectedTransaction.userName}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-grey mb-1">Email</p>
                  <p className="text-admin-primary font-medium">
                    {selectedTransaction.userEmail || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-admin-primary mb-3">
                Transaction Information
              </h3>
              <div className="space-y-4 text-sm bg-admin-primary/8 p-2 rounded-md">
                <div className="flex items-center justify-between">
                  <p className="text-grey mb-1">Transaction ID</p>
                  <p className="text-admin-primary font-medium">
                    {selectedTransaction.id}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-grey mb-1">Transaction Date</p>
                  <p className="text-admin-primary font-medium">
                    {formatDateTime(selectedTransaction.dateTime)}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-grey mb-1">Method</p>
                  <p className="text-admin-primary font-medium capitalize">
                    {selectedTransaction.method}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-grey mb-1">Amount</p>
                  <p className="text-admin-primary font-medium">
                    {formatCompactCurrency(selectedTransaction.amount)}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-grey mb-1">Payment Status</p>
                  <Badge
                    variant={
                      selectedTransaction.status === "successful"
                        ? "success"
                        : selectedTransaction.status === "pending"
                        ? "warning"
                        : selectedTransaction.status === "failed"
                        ? "danger"
                        : "default"
                    }
                  >
                    {selectedTransaction.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-admin-primary mb-3">
                Change Status
              </h3>
              <div className="flex flex-wrap gap-3">
                {["pending", "successful", "failed"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => {
                      if (status === "refund") {
                        setShowRefundModal(true);
                      } else {
                        setTempStatus(status);
                      }
                    }}
                    className={`px-5 py-1.5 rounded-md border transition-all capitalize ${
                      tempStatus === status
                        ? "border-[#A1CBFF] text-[#3291FF] bg-secondary"
                        : "border-admin-primary/35 text-admin-primary"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-center space-x-5 pt-5">
              <Button
                type="button"
                variant="secondary"
                onClick={handleBackToList}
              >
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
                  onClick={() => setActiveTab("transactions")}
                  className={`px-4 py-2 rounded-sm text-sm transition-all ${
                    activeTab === "transactions"
                      ? "bg-admin-primary text-white"
                      : "bg-admin-primary/5 text-admin-primary"
                  }`}
                >
                  Transactions
                </button>
                <button
                  onClick={() => setActiveTab("settlements")}
                  className={`px-4 py-2 rounded-sm text-sm transition-all ${
                    activeTab === "settlements"
                      ? "bg-admin-primary text-white"
                      : "bg-admin-primary/5 text-admin-primary"
                  }`}
                >
                  Settlements
                </button>
                <button
                  onClick={() => setActiveTab("revenue")}
                  className={`px-4 py-2 rounded-sm text-sm transition-all ${
                    activeTab === "revenue"
                      ? "bg-admin-primary text-white"
                      : "bg-admin-primary/5 text-admin-primary"
                  }`}
                >
                  Revenue
                </button>
              </div>
              <Button onClick={handleExport} disabled={exporting}>
                {exporting ? "Exporting..." : "Export"}
              </Button>
            </div>
          </div>

          {activeTab === "transactions" && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-admin-primary/4 p-6 gap-4">
                <div>
                  <h2 className="text-sm text-admin-primary/60 mb-1">
                    All Transactions
                  </h2>
                  <p className="text-2xl font-bold text-admin-primary">
                    {filteredTransactions.length}
                  </p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-grey"
                      size={20}
                    />
                    <input
                      type="text"
                      placeholder="Search transactions"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white rounded-lg focus:outline-none sm:w-96"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 bg-white rounded-lg focus:outline-none"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="successful">Successful</option>
                    <option value="failed">Failed</option>
                  </select>
                  <select
                    value={paymentMethodFilter}
                    onChange={(e) => setPaymentMethodFilter(e.target.value)}
                    className="px-4 py-2 bg-white rounded-lg focus:outline-none"
                  >
                    <option value="all">All Methods</option>
                    <option value="paystack">Paystack</option>
                    <option value="nova">Nova</option>
                    <option value="payaza">Payaza</option>
                    <option value="stripe">Stripe</option>
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
                  {tableLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <LoadingSpinner size="lg" />
                    </div>
                  ) : paginatedTransactions.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                      <p className="text-admin-primary/60">
                        No transactions found
                      </p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-accent-1 shadow-md shadow-black">
                        <tr>
                          <th className="text-left font-medium text-admin-primary px-6 py-4">
                            Transaction ID
                          </th>
                          <th className="text-left font-medium text-admin-primary px-6 py-4">
                            User
                          </th>
                          <th className="text-left font-medium text-admin-primary px-6 py-4">
                            Amount
                          </th>
                          <th className="text-left font-medium text-admin-primary px-6 py-4">
                            Method
                          </th>
                          <th className="text-left font-medium text-admin-primary px-6 py-4">
                            Date & Time
                          </th>
                          <th className="text-left font-medium text-admin-primary px-6 py-4">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedTransactions.map((transaction) => (
                          <tr
                            key={transaction.id}
                            onClick={() => handleViewTransaction(transaction)}
                            className="border-b border-accent-2 transition-colors bg-white cursor-pointer"
                          >
                            <td className="px-6 py-4 text-admin-primary">
                              {transaction.id}
                            </td>
                            <td className="px-6 py-4 text-admin-primary">
                              {transaction.userName}
                            </td>
                            <td className="px-6 py-4 text-admin-primary">
                              {formatCompactCurrency(transaction.amount)}
                            </td>
                            <td className="px-6 py-4 text-admin-primary capitalize">
                              {transaction.method}
                            </td>
                            <td className="px-6 py-4 text-admin-primary">
                              {formatDateTime(transaction.dateTime)}
                            </td>
                            <td className="px-6 py-4">
                              <Badge
                                variant={
                                  transaction.status === "successful"
                                    ? "success"
                                    : transaction.status === "pending"
                                    ? "warning"
                                    : transaction.status === "failed"
                                    ? "danger"
                                    : "default"
                                }
                              >
                                {transaction.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Pagination Controls */}
              {filteredTransactions.length > 0 && (
                <div className="bg-admin-primary/4 p-4 rounded-b-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-admin-primary/60">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(endIndex, filteredTransactions.length)} of{" "}
                    {filteredTransactions.length} transactions
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      className={`px-3 py-2 rounded-lg border border-accent-2 transition-colors flex items-center gap-1 ${
                        currentPage === 1
                          ? "opacity-50 cursor-not-allowed text-grey"
                          : "text-admin-primary hover:bg-accent-1"
                      }`}
                    >
                      <ChevronLeft size={18} />
                      Previous
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                          // Show first page, last page, current page, and pages around current
                          if (page === 1 || page === totalPages) return true;
                          if (Math.abs(page - currentPage) <= 1) return true;
                          return false;
                        })
                        .map((page, index, array) => {
                          // Add ellipsis if there's a gap
                          const showEllipsisBefore =
                            index > 0 && array[index - 1] !== page - 1;
                          return (
                            <div key={page} className="flex items-center gap-1">
                              {showEllipsisBefore && (
                                <span className="px-2 text-grey">...</span>
                              )}
                              <button
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-2 rounded-lg border transition-colors ${
                                  currentPage === page
                                    ? "bg-admin-primary text-white border-admin-primary"
                                    : "border-accent-2 text-admin-primary hover:bg-accent-1"
                                }`}
                              >
                                {page}
                              </button>
                            </div>
                          );
                        })}
                    </div>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                      className={`px-3 py-2 rounded-lg border border-accent-2 transition-colors flex items-center gap-1 ${
                        currentPage === totalPages
                          ? "opacity-50 cursor-not-allowed text-grey"
                          : "text-admin-primary hover:bg-accent-1"
                      }`}
                    >
                      Next
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "settlements" && (
            <div className="bg-admin-primary/4 rounded-b-xl p-6">
              <div className="space-y-4">
                {settlements.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <p className="text-admin-primary/60">
                      No settlements found
                    </p>
                  </div>
                ) : (
                  settlements.map((settlement) => (
                    <div
                      key={settlement.id}
                      className="bg-white rounded-lg p-6 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-semibold text-admin-primary capitalize">
                          {settlement.gateway}
                        </span>
                        <Badge variant="success">Settled</Badge>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-grey mb-1">Gross Amount</p>
                          <p className="text-lg font-semibold text-admin-primary">
                            {formatCompactCurrency(settlement.grossAmount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-grey mb-1">Gateway Fee</p>
                          <p className="text-lg font-semibold text-red-600">
                            -{formatCompactCurrency(settlement.gatewayFee)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-grey mb-1">Net Payout</p>
                          <p className="text-lg font-semibold text-green-600">
                            {formatCompactCurrency(settlement.netPayout)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-grey mb-1">
                            Settlement Date
                          </p>
                          <p className="text-lg font-semibold text-admin-primary">
                            {formatDate(settlement.settlementDate)}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex flex-row items-center"
                      >
                        <Download size={14} className="mr-2" />
                        Download Report
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "revenue" && (
            <>
              <div className="flex items-center justify-between bg-admin-primary/4 p-6">
                <h2 className="text-lg font-semibold text-admin-primary">
                  Revenue Overview
                </h2>
                <div className="flex items-center space-x-2">
                  <div className="relative" ref={datePickerRef}>
                    <button
                      type="button"
                      onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                      className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg border border-admin-primary/35 hover:bg-accent-1 transition-colors cursor-pointer"
                    >
                      <Calendar size={18} className="text-admin-primary" />
                      <span className="text-admin-primary text-sm">
                        {revenueDateRange.from && revenueDateRange.to
                          ? `${format(
                              revenueDateRange.from,
                              "MMM dd, yyyy"
                            )} - ${format(revenueDateRange.to, "MMM dd, yyyy")}`
                          : "Select Date Range"}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`text-admin-primary transition-transform ${
                          isDatePickerOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isDatePickerOpen && (
                      <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-xl shadow-xl border border-admin-primary/35 p-4">
                        <DayPicker
                          mode="range"
                          selected={revenueDateRange}
                          onSelect={(range) => {
                            setRevenueDateRange({
                              from: range?.from,
                              to: range?.to,
                            });
                          }}
                          numberOfMonths={1}
                          className="custom-day-picker"
                        />
                        <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-admin-primary/35">
                          <button
                            type="button"
                            onClick={() => {
                              setRevenueDateRange({
                                from: undefined,
                                to: undefined,
                              });
                              setIsDatePickerOpen(false);
                              setRevenueDateFilter("monthly");
                              // Reload analytics with the default filter
                              loadRevenueAnalytics();
                            }}
                            className="px-4 py-2 text-sm text-admin-primary hover:bg-accent-1 rounded-lg transition-colors"
                          >
                            Clear
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                revenueDateRange.from &&
                                revenueDateRange.to
                              ) {
                                setIsDatePickerOpen(false);
                                // Reload analytics with the new date range
                                // start_date and end_date will be used instead of date_filter
                                loadRevenueAnalytics();
                              }
                            }}
                            disabled={
                              !revenueDateRange.from || !revenueDateRange.to
                            }
                            className="px-4 py-2 text-sm bg-admin-primary text-white rounded-lg transition-colors hover:bg-admin-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <select
                    value={revenueDateFilter}
                    onChange={(e) => {
                      setRevenueDateFilter(e.target.value);
                      setRevenueDateRange({ from: undefined, to: undefined });
                    }}
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
                {revenueLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatsCard
                      icon={TbMoneybag}
                      title="Total Revenue"
                      value={formatCompactCurrency(totalRevenue)}
                      change={12.5}
                      iconBgColor="bg-white"
                      iconColor="text-[#626262]"
                    />
                    <StatsCard2
                      icon={TrendingUp}
                      title="Tax Collected"
                      value={formatCompactCurrency(taxCollected)}
                      change={8.3}
                      iconBgColor="bg-white"
                      iconColor="text-[#626262]"
                    />
                    <StatsCard
                      icon={DollarSign}
                      title="Net After Fees"
                      value={formatCompactCurrency(netAfterFees)}
                      change={15.7}
                      iconBgColor="bg-white"
                      iconColor="text-[#626262]"
                    />
                  </div>
                )}
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
              <div className="flex items-center justify-between">
                <p className="text-grey mb-1">Transaction ID</p>
                <p className="text-admin-primary font-medium">
                  {selectedTransaction.id}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-grey mb-1">User</p>
                <p className="text-admin-primary font-medium">
                  {selectedTransaction.userName}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-grey mb-1">Amount</p>
                <p className="text-admin-primary font-medium">
                  {formatCompactCurrency(selectedTransaction.amount)}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-admin-primary font-medium mb-2">
                Reason for Refund
              </label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Enter reason for processing this refund..."
                rows={4}
                className="w-full px-4 py-3 border border-admin-primary/35 rounded-lg focus:outline-none resize-none"
              />
            </div>

            <div className="flex justify-center space-x-5 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowRefundModal(false)}
              >
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
