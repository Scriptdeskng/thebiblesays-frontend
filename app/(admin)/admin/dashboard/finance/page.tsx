"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import "react-day-picker/dist/style.css";
import { Button, Modal, Badge, LoadingSpinner } from "@/components/admin/ui";
import {
  Transaction,
  ApiTransaction,
  RevenueAnalytics,
} from "@/types/admin.types";
// import { mockSettlements } from "@/services/mock.service";
import { dashboardService } from "@/services/dashboard.service";
import { formatCompactCurrency, formatDateTime } from "@/lib/utils";
import { TbMoneybag } from "react-icons/tb";
import { BsCalendar3 } from "react-icons/bs";
import { FaCreditCard } from "react-icons/fa";
import { HiSquare3Stack3D } from "react-icons/hi2";
import toast from "react-hot-toast";
import clsx from "clsx";

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [revenueAnalytics, setRevenueAnalytics] =
    useState<RevenueAnalytics | null>(null);
  const [revenueLoading, setRevenueLoading] = useState(true);
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [exporting, setExporting] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [selectedRange, setSelectedRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [isMainDatePickerOpen, setIsMainDatePickerOpen] = useState(false);
  const mainDatePickerRef = useRef<HTMLDivElement>(null);
  const [timePeriodFilter, setTimePeriodFilter] = useState<string>("monthly");

  const mapApiTransactionToTransaction = (
    apiTx: ApiTransaction
  ): Transaction => {
    const userEmail = apiTx.user_email || "";
    const emailName = userEmail ? userEmail.split("@")[0] : "Unknown";
    const userName = emailName
      ? emailName.charAt(0).toUpperCase() + emailName.slice(1)
      : "Unknown User";

    const paymentMethod = (apiTx.payment_method || "").toLowerCase();
    const normalizedMethod: "paystack" | "nova" | "payaza" | "stripe" =
      paymentMethod === "paystack" ||
      paymentMethod === "nova" ||
      paymentMethod === "payaza" ||
      paymentMethod === "stripe"
        ? paymentMethod
        : "paystack"; // Default fallback

    const apiStatus = (apiTx.status || "pending").toLowerCase();
    const normalizedStatus: "pending" | "successful" | "failed" =
      apiStatus === "pending" ||
      apiStatus === "successful" ||
      apiStatus === "failed"
        ? apiStatus
        : "pending"; // Default fallback

    return {
      id: apiTx.id?.toString() || "",
      userId: "",
      userName: userName,
      userEmail: userEmail,
      orderNumber: apiTx.order_number || "",
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

      const mappedTransactions = apiTransactions.map(
        mapApiTransactionToTransaction
      );
      setTransactions(mappedTransactions);
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

      if (dateRange[0] && dateRange[1]) {
        params.start_date = dateRange[0].toISOString().split("T")[0];
        params.end_date = dateRange[1].toISOString().split("T")[0];
      } else if (timePeriodFilter) {
        const dateFilterMap: Record<string, string> = {
          today: "today",
          weekly: "weekly",
          monthly: "monthly",
        };
        if (dateFilterMap[timePeriodFilter]) {
          params.date_filter = dateFilterMap[timePeriodFilter];
        }
      }

      const analytics = await dashboardService.getRevenueAnalytics(params);
      setRevenueAnalytics(analytics);
    } catch (error) {
      console.error("Error loading revenue analytics:", error);
      toast.error("Failed to load revenue analytics");
    } finally {
      setRevenueLoading(false);
    }
  }, [timePeriodFilter, dateRange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadRevenueAnalytics();
  }, [loadRevenueAnalytics]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setIsDatePickerOpen(false);
      }
      if (
        mainDatePickerRef.current &&
        !mainDatePickerRef.current.contains(event.target as Node)
      ) {
        setIsMainDatePickerOpen(false);
      }
    };

    if (isDatePickerOpen || isMainDatePickerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDatePickerOpen, isMainDatePickerOpen]);

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

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    endIndex
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, paymentMethodFilter, durationFilter, searchQuery]);

  const totalRevenue = revenueAnalytics?.total_revenue
    ? parseFloat(String(revenueAnalytics.total_revenue))
    : 0;

  const taxCollected = 0;
  const platformFees = 0;
  const netAfterFees = totalRevenue;

  const totalRevenueChange = 0.0;
  const netRevenueChange = 0.0;
  const platformFeesChange = 0.0;
  const taxCollectedChange = 0.0;

  const formatDateRange = () => {
    if (dateRange[0] && dateRange[1]) {
      return `${format(dateRange[0], "MMM yyyy")} - ${format(
        dateRange[1],
        "MMM yyyy"
      )}`;
    }
    return "Jan 2025 - Dec 2025";
  };

  return (
    <div>
      {!showTransactionDetails && (
        <>
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-xl lg:text-2xl font-medium text-admin-primary mb-1">
                  Finance management
                </h1>
                <p className="text-sm text-admin-primary/60">
                  Monitor transactions, settlements, and revenue insights.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative" ref={mainDatePickerRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMainDatePickerOpen(!isMainDatePickerOpen);
                      if (!isMainDatePickerOpen) {
                        setSelectedRange({
                          from: dateRange[0] || undefined,
                          to: dateRange[1] || undefined,
                        });
                      }
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-white border border-accent-2 rounded-lg text-sm transition-all text-admin-primary hover:bg-accent-1"
                  >
                    <Calendar size={16} className="shrink-0" />
                    <span className="whitespace-nowrap">
                      {formatDateRange()}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${
                        isMainDatePickerOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isMainDatePickerOpen && (
                    <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-xl shadow-xl border border-accent-2 p-4">
                      <DayPicker
                        mode="range"
                        selected={selectedRange}
                        onSelect={(range) => {
                          setSelectedRange({
                            from: range?.from,
                            to: range?.to,
                          });
                        }}
                        numberOfMonths={1}
                        className="custom-day-picker"
                      />
                      <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-accent-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRange({
                              from: undefined,
                              to: undefined,
                            });
                            const clearedRange: [Date | null, Date | null] = [
                              null,
                              null,
                            ];
                            setDateRange(clearedRange);
                            setIsMainDatePickerOpen(false);
                          }}
                          className="px-4 py-2 text-sm text-admin-primary hover:bg-accent-2 rounded-lg transition-colors"
                        >
                          Clear
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedRange.from && selectedRange.to) {
                              const newRange: [Date | null, Date | null] = [
                                selectedRange.from,
                                selectedRange.to,
                              ];
                              setDateRange(newRange);
                              setIsMainDatePickerOpen(false);
                            }
                          }}
                          disabled={!selectedRange.from || !selectedRange.to}
                          className="px-4 py-2 text-sm bg-admin-primary text-white rounded-lg transition-colors hover:bg-admin-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {["today", "weekly", "monthly"].map((period) => (
                    <button
                      key={period}
                      onClick={() => {
                        setTimePeriodFilter(period);
                        // Clear date range when selecting a time period filter
                        setDateRange([null, null]);
                      }}
                      className={`px-4 py-2 rounded-lg text-sm transition-all capitalize ${
                        timePeriodFilter === period
                          ? "bg-admin-primary text-white"
                          : "bg-white border border-accent-2 text-admin-primary hover:bg-accent-1"
                      }`}
                    >
                      {period === "today"
                        ? "Today"
                        : period === "weekly"
                        ? "Weekly"
                        : "Monthly"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* Total revenue */}
              <div className="bg-admin-primary/4 rounded-xl p-6 border border-accent-2">
                <div className="flex items-start gap-2 xl:gap-5">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                    <TbMoneybag className="text-[#626262]" size={20} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm mb-1 text-admin-primary/60">
                      Total revenue
                    </p>
                    {revenueLoading ? (
                      <div className="flex items-center h-9">
                        <LoadingSpinner size="sm" />
                      </div>
                    ) : (
                      <p className="text-3xl font-extrabold text-admin-primary truncate">
                        {formatCompactCurrency(totalRevenue)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex items-center space-x-1 text-sm rounded-lg py-1 px-2 text-[#2AA31F] bg-[#2AA31F]/15">
                    <TrendingUp size={16} />
                    <span className="font-medium">
                      {Math.abs(totalRevenueChange)}%
                    </span>
                  </div>
                  <p className="text-[#ABABAB] text-sm">vs yesterday</p>
                </div>
              </div>

              {/* Net revenue after fee */}
              <div className="bg-admin-primary/4 rounded-xl p-6 border border-accent-2">
                <div className="flex items-start gap-2 xl:gap-5">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                    <FaCreditCard className="text-[#626262]" size={20} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm mb-1 text-admin-primary/60">
                      Net revenue after fee
                    </p>
                    {revenueLoading ? (
                      <div className="flex items-center h-9">
                        <LoadingSpinner size="sm" />
                      </div>
                    ) : (
                      <p className="text-3xl font-extrabold text-admin-primary truncate">
                        {formatCompactCurrency(netAfterFees)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex items-center space-x-1 text-sm rounded-lg py-1 px-2 text-[#2AA31F] bg-[#2AA31F]/15">
                    <TrendingUp size={16} />
                    <span className="font-medium">
                      {Math.abs(netRevenueChange)}%
                    </span>
                  </div>
                  <p className="text-[#ABABAB] text-sm">vs last week</p>
                </div>
              </div>

              {/* Platform fee/charges - Dark background */}
              <div className="bg-admin-primary rounded-xl p-6">
                <div className="flex items-start gap-2 xl:gap-5">
                  <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center">
                    <BsCalendar3 className="text-black" size={20} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm mb-1 text-[#ABABAB]">
                      Platform fee/charges
                    </p>
                    {revenueLoading ? (
                      <div className="flex items-center h-9">
                        <LoadingSpinner size="sm" />
                      </div>
                    ) : (
                      <p className="text-3xl font-extrabold text-white truncate">
                        {formatCompactCurrency(platformFees)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex items-center space-x-1 text-sm rounded-lg py-1 px-2 text-red-600 bg-red-50">
                    <TrendingDown size={16} />
                    <span className="font-medium">
                      {Math.abs(platformFeesChange)}%
                    </span>
                  </div>
                  <p className="text-[#ABABAB] text-sm">vs last month</p>
                </div>
              </div>

              {/* Tax collected */}
              <div className="bg-admin-primary/4 rounded-xl p-6 border border-accent-2">
                <div className="flex items-start gap-2 xl:gap-5">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                    <HiSquare3Stack3D className="text-[#626262]" size={20} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm mb-1 text-admin-primary/60">
                      Tax collected
                    </p>
                    {revenueLoading ? (
                      <div className="flex items-center h-9">
                        <LoadingSpinner size="sm" />
                      </div>
                    ) : (
                      <p className="text-3xl font-extrabold text-admin-primary truncate">
                        {formatCompactCurrency(taxCollected)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex items-center space-x-1 text-sm rounded-lg py-1 px-2 text-[#2AA31F] bg-[#2AA31F]/15">
                    <TrendingUp size={16} />
                    <span className="font-medium">
                      {Math.abs(taxCollectedChange)}%
                    </span>
                  </div>
                  <p className="text-[#ABABAB] text-sm">vs last week</p>
                </div>
              </div>
            </div>
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
                  <p className="text-grey mb-1">Order Number</p>
                  <p className="text-admin-primary font-medium">
                    {selectedTransaction.orderNumber}
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
        <div className="bg-[#1A1A1A0A] rounded-[10px] py-8">
          <div className="mb-6 px-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <h2 className="text-xl lg:text-2xl font-medium text-admin-primary">
                Transaction History
              </h2>
              <Button
                onClick={handleExport}
                disabled={exporting}
                className="bg-admin-primary text-white hover:bg-admin-primary/90"
              >
                {exporting ? "Exporting..." : "Export"}
              </Button>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <p className="text-sm text-admin-primary/60 mb-1">
                  All Transaction
                </p>
                <p className="text-2xl font-bold text-admin-primary">
                  {filteredTransactions.length}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-grey"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search by transaction ID"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-accent-2 rounded-lg focus:outline-none sm:w-64"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-white border border-accent-2 rounded-lg focus:outline-none text-sm"
                >
                  <option value="all">All status</option>
                  <option value="pending">Pending</option>
                  <option value="successful">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refund</option>
                </select>
                <select
                  value={paymentMethodFilter}
                  onChange={(e) => setPaymentMethodFilter(e.target.value)}
                  className="px-4 py-2 bg-white border border-accent-2 rounded-lg focus:outline-none text-sm"
                >
                  <option value="all">Payment</option>
                  <option value="paystack">Paystack</option>
                  <option value="nova">Nova</option>
                  <option value="payaza">Payaza</option>
                  <option value="stripe">Stripe</option>
                </select>
                <select
                  value={durationFilter}
                  onChange={(e) => setDurationFilter(e.target.value)}
                  className="px-4 py-2 bg-white border border-accent-2 rounded-lg focus:outline-none text-sm"
                >
                  <option value="today">Today</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-hidden">
            <div className="overflow-x-auto">
              {tableLoading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : paginatedTransactions.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-admin-primary/60">No transactions found</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-accent-2">
                      <th className="text-left font-medium text-admin-primary px-6 py-4">
                        Transaction ID
                      </th>
                      <th className="text-left font-medium text-admin-primary px-6 py-4">
                        Order Number
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
                    {paginatedTransactions.map((transaction, index) => {
                      let statusVariant:
                        | "default"
                        | "success"
                        | "warning"
                        | "danger" = "default";
                      let statusText: string = transaction.status;

                      if (transaction.status === "successful") {
                        statusVariant = "success";
                        statusText = "Completed";
                      } else if (transaction.status === "pending") {
                        statusVariant = "warning";
                        statusText = "Pending";
                      } else if (transaction.status === "failed") {
                        statusVariant = "danger";
                        statusText = "Failed";
                      } else if (transaction.status === "refunded") {
                        statusVariant = "warning";
                        statusText = "Refund";
                      }

                      return (
                        <tr
                          key={transaction.id}
                          onClick={() => handleViewTransaction(transaction)}
                          className={clsx(
                            "not-last:border-b border-accent-2 transition-colors cursor-pointer",
                            index % 2 === 0 ? "bg-white" : "bg-accent-1"
                          )}
                        >
                          <td className="px-6 py-4 text-admin-primary">
                            {transaction.id}
                          </td>
                          <td className="px-6 py-4 text-admin-primary">
                            {transaction.orderNumber}
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
                            <Badge variant={statusVariant}>{statusText}</Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {filteredTransactions.length > 0 && (
            <div className="flex items-center justify-end gap-2 mt-10">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-lg border border-accent-2 transition-colors flex items-center gap-1 text-sm ${
                  currentPage === 1
                    ? "opacity-50 cursor-not-allowed text-grey"
                    : "text-admin-primary hover:bg-accent-1"
                }`}
              >
                <ChevronLeft size={18} />
                Prev
              </button>
              <div className="flex items-center gap-1">
                {Array.from(
                  { length: Math.min(totalPages, 5) },
                  (_, i) => i + 1
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-lg border transition-colors text-sm ${
                      currentPage === page
                        ? "bg-admin-primary text-white border-admin-primary"
                        : "border-accent-2 text-admin-primary hover:bg-accent-1"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded-lg border border-accent-2 transition-colors flex items-center gap-1 text-sm ${
                  currentPage === totalPages
                    ? "opacity-50 cursor-not-allowed text-grey"
                    : "text-admin-primary hover:bg-accent-1"
                }`}
              >
                Next
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
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
