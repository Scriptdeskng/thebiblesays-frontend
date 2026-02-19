"use client";

import { useState, useCallback } from "react";
import { dashboardService } from "@/services/dashboard.service";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import type { CustomMerchOrderRow, ByomOrderResult } from "../types";

const ORDERS_PER_PAGE = 10;

function mapResultToRow(item: ByomOrderResult, index: number): CustomMerchOrderRow {
  const orderId = String(item.id);
  const products = item.product_name || item.name || "—";
  const customer = item.user
    ? [item.user.first_name, item.user.last_name].filter(Boolean).join(" ") || item.user.email || "—"
    : "—";
  const dateRaw = item.created_at ?? "";
  const date = dateRaw ? formatDate(dateRaw) : "—";
  const statusRaw = (item.status ?? "pending").toString().replace(/_/g, " ");
  const status = statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1);
  const amount = item.pricing_breakdown?.total ?? 0;
  return {
    id: `${item.id}-${index}`,
    orderId,
    products,
    customer,
    amount,
    date,
    status,
  };
}

export function useByomOrders() {
  const [orders, setOrders] = useState<CustomMerchOrderRow[]>([]);
  const [orderResults, setOrderResults] = useState<ByomOrderResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<ByomOrderResult | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const { count, results } = await dashboardService.getByomDesignsWithOrders();
      const list = results as ByomOrderResult[];
      const rows: CustomMerchOrderRow[] = list.map((item, index) =>
        mapResultToRow(item, index)
      );
      setOrders(rows);
      setOrderResults(list);
      setTotalCount(count);
      setCurrentPage(1);
    } catch {
      toast.error("Failed to load custom merch orders");
    } finally {
      setLoading(false);
    }
  }, []);

  const viewOrder = useCallback((orderId: string) => {
    const id = Number(orderId);
    const found = orderResults.find((r) => r.id === id);
    if (found) setSelectedOrder(found);
  }, [orderResults]);

  const backToOrders = useCallback(() => {
    setSelectedOrder(null);
  }, []);

  const totalPages = Math.max(
    1,
    Math.ceil(totalCount / ORDERS_PER_PAGE)
  );

  return {
    orders,
    orderResults,
    loading,
    currentPage,
    setCurrentPage,
    totalPages,
    ordersPerPage: ORDERS_PER_PAGE,
    loadOrders,
    selectedOrder,
    viewOrder,
    backToOrders,
  };
}
