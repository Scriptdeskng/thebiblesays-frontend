"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { StatsCard, LoadingSpinner, StatsCard2 } from "@/components/admin/ui";
import { dashboardService } from "@/services/dashboard.service";
import { calculatePercentage, formatCompactCurrency } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DashboardOverview, SalesData } from "@/types/admin.types";
import { BsCalendar2Fill, BsFillBagHeartFill } from "react-icons/bs";
import { RiTShirtFill } from "react-icons/ri";
import { FaPalette } from "react-icons/fa";
import { HiUsers } from "react-icons/hi2";
import { DonutChart } from "@/components/admin/ui/DonutChart";
import toast from "react-hot-toast";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import "react-day-picker/dist/style.css";

export default function DashboardPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("");
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
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const [startDate, endDate] = dateRange;

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

  const loadData = useCallback(
    async (customDateRange?: [Date | null, Date | null]) => {
      try {
        setLoading(true);
        const rangeToUse = customDateRange || dateRange;
        const data = await dashboardService.getOverview(dateFilter, rangeToUse);
        setOverview(data);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    },
    [dateFilter, dateRange]
  );

  useEffect(() => {
    // Load data on initial mount or when filter changes
    loadData();
  }, [dateFilter, loadData]);

  useEffect(() => {
    // Load data when date range is selected
    if (dateRange[0] && dateRange[1]) {
      loadData();
    }
  }, [dateRange, loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-grey">No data available</p>
      </div>
    );
  }

  const totalRecentOrders = overview.recent_orders.length;

  // Count orders by status
  const statusCounts = {
    placed: overview.recent_orders.filter((o) => o.status === "placed").length,
    processing: overview.recent_orders.filter((o) => o.status === "processing")
      .length,
    shipped: overview.recent_orders.filter((o) => o.status === "shipped")
      .length,
    delivered: overview.recent_orders.filter((o) => o.status === "delivered")
      .length,
    cancelled: overview.recent_orders.filter((o) => o.status === "cancelled")
      .length,
    pending: overview.recent_orders.filter((o) => o.status === "pending")
      .length,
  };

  const orderSummary = [
    {
      name: "Placed",
      value:
        totalRecentOrders > 0
          ? calculatePercentage(statusCounts.placed, totalRecentOrders)
          : 0,
      color: "#10b981",
    },
    {
      name: "Processing",
      value:
        totalRecentOrders > 0
          ? calculatePercentage(statusCounts.processing, totalRecentOrders)
          : 0,
      color: "#8b5cf6",
    },
    {
      name: "Shipped",
      value:
        totalRecentOrders > 0
          ? calculatePercentage(statusCounts.shipped, totalRecentOrders)
          : 0,
      color: "#06b6d4",
    },
    {
      name: "Delivered",
      value:
        totalRecentOrders > 0
          ? calculatePercentage(statusCounts.delivered, totalRecentOrders)
          : 0,
      color: "#22c55e",
    },
    {
      name: "Cancelled",
      value:
        totalRecentOrders > 0
          ? calculatePercentage(statusCounts.cancelled, totalRecentOrders)
          : 0,
      color: "#ef4444",
    },
    {
      name: "Pending",
      value:
        totalRecentOrders > 0
          ? calculatePercentage(statusCounts.pending, totalRecentOrders)
          : 0,
      color: "#f97316",
    },
  ].filter((item) => item.value > 0);

  const bestSellers = overview.top_products.slice(0, 5);

  const salesData: SalesData[] = overview.daily_sales || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium text-admin-primary mb-1 lg:text-2xl">
            Dashboard Overview
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative" ref={datePickerRef}>
            <button
              type="button"
              onClick={() => {
                setIsDatePickerOpen(!isDatePickerOpen);
                // Sync selectedRange with current dateRange when opening
                if (!isDatePickerOpen) {
                  setSelectedRange({
                    from: startDate || undefined,
                    to: endDate || undefined,
                  });
                }
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-accent-3 hover:bg-accent-2 rounded-lg text-sm transition-all text-admin-primary/90 hover:text-admin-primary font-medium"
            >
              <BsCalendar2Fill size={16} className="shrink-0" />
              <span className="whitespace-nowrap">
                {startDate && endDate
                  ? `${format(startDate, "MMM dd, yyyy")} - ${format(
                      endDate,
                      "MMM dd, yyyy"
                    )}`
                  : "Select date range"}
              </span>
            </button>

            {isDatePickerOpen && (
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
                      setSelectedRange({ from: undefined, to: undefined });
                      const clearedRange: [Date | null, Date | null] = [
                        null,
                        null,
                      ];
                      setDateRange(clearedRange);
                      setIsDatePickerOpen(false);
                      loadData(clearedRange);
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
                        setIsDatePickerOpen(false);
                        loadData(newRange);
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
          <button
            onClick={() => setDateFilter("today")}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${
              dateFilter === "today"
                ? "bg-admin-primary text-white"
                : "bg-accent-3 text-admin-primary hover:bg-accent-2"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setDateFilter("weekly")}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${
              dateFilter === "weekly"
                ? "bg-admin-primary text-white"
                : "bg-accent-3 text-admin-primary hover:bg-accent-2"
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setDateFilter("monthly")}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${
              dateFilter === "monthly"
                ? "bg-admin-primary text-white"
                : "bg-accent-3 text-admin-primary hover:bg-accent-2"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setDateFilter("")}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${
              dateFilter === ""
                ? "bg-admin-primary text-white"
                : "bg-accent-3 text-admin-primary hover:bg-accent-2"
            }`}
          >
            All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={RiTShirtFill}
          title="Total Sales"
          value={formatCompactCurrency(overview.total_sales)}
          change={0}
          iconBgColor="bg-white"
          iconColor="text-admin-primary/25"
        />
        <StatsCard
          icon={BsFillBagHeartFill}
          title="Total Orders"
          value={overview.total_orders}
          change={0}
          iconBgColor="bg-white"
          iconColor="text-admin-primary/25"
        />
        <StatsCard2
          icon={FaPalette}
          title="Custom Designs"
          value={overview.monthly_stats.custom_designs}
          change={0}
          iconBgColor="bg-white"
          iconColor="text-admin-primary/25"
        />
        <StatsCard
          icon={HiUsers}
          title="Total Users"
          value={overview.total_users}
          change={0}
          iconBgColor="bg-white"
          iconColor="text-admin-primary/25"
        />
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-medium text-admin-primary mb-4 lg:text-2xl">
          Sales Overview
        </h2>
        <div className="bg-admin-primary/4 rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-sm text-admin-primary/60 mb-1">
                Total sales
              </h2>
              <p className="text-2xl font-bold text-admin-primary">
                {formatCompactCurrency(
                  salesData.reduce((sum, item) => sum + item.daily_total, 0)
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <span className="text-sm text-grey">
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E9E9EB" />
              <XAxis
                dataKey="date"
                stroke="#5C5F6A"
                style={{ fontSize: "12px" }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <YAxis
                stroke="#5C5F6A"
                style={{ fontSize: "12px" }}
                tickFormatter={(value) => `₦${value / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #E9E9EB",
                  borderRadius: "8px",
                }}
                formatter={(value: any) => [formatCompactCurrency(value), "Sales"]}
                labelFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  });
                }}
              />
              <Line
                type="monotone"
                dataKey="daily_total"
                stroke="#0E1422"
                strokeWidth={2}
                dot={{ fill: "#0E1422", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
        <div>
          <h2 className="text-xl font-medium text-admin-primary mb-4 lg:text-2xl">
            Best Selling Products
          </h2>
          <div className="bg-admin-primary/4 rounded-xl">
            <div className="overflow-x-auto p-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-accent-2">
                    <th className="text-left font-medium text-admin-primary pb-3">
                      Product
                    </th>
                    <th className="text-left font-medium text-admin-primary pb-3">
                      Sales
                    </th>
                    <th className="text-left font-medium text-admin-primary pb-3">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bestSellers.map((product, index) => (
                    <tr
                      key={index}
                      className="border-b border-accent-2 last:border-0"
                    >
                      <td className="py-4">
                        <p className=" text-admin-primary">
                          {product.product_name}
                        </p>
                      </td>
                      <td className="py-4 text-admin-primary">
                        {product.total_quantity}
                      </td>
                      <td className="py-4 text-[#2AA31F]">
                        {formatCompactCurrency(product.total_sales)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-medium text-admin-primary mb-4 lg:text-2xl">
            Order Summary
          </h2>
          <div className="bg-admin-primary/4 rounded-xl p-6">
            <div className="flex items-center justify-center py-8">
              <div className="w-48 h-48 relative">
                <DonutChart data={orderSummary} size={192} strokeWidth={24} />
              </div>
            </div>

            <div className="mt-10 flex items-center justify-between w-full">
              {orderSummary.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between"
                >
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
