"use client";

import { useState, useCallback } from "react";
import { dashboardService } from "@/services/dashboard.service";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import type { CustomMerchOrderRow } from "../types";

const ORDERS_PER_PAGE = 10;

export function useByomOrders() {
  const [orders, setOrders] = useState<CustomMerchOrderRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getByomDesignsWithOrders();
      const rows: CustomMerchOrderRow[] = [];
      const push = (item: any) => {
        const orderId =
          item.order_id ?? item.order_number ?? item.id ?? item.orderId ?? "";
        const products =
          item.products ??
          item.product_name ??
          item.design_name ??
          item.product_names ??
          "—";
        const customer =
          item.customer ??
          item.customer_name ??
          (item.user
            ? [item.user.first_name, item.user.last_name]
                .filter(Boolean)
                .join(" ") || item.user.email
            : null) ??
          "—";
        const amount =
          typeof item.amount === "number"
            ? item.amount
            : typeof item.total === "number"
            ? item.total
            : parseFloat(item.amount ?? item.total ?? "0") || 0;
        const dateRaw = item.date ?? item.created_at ?? item.order_date ?? "";
        const date = dateRaw ? formatDate(dateRaw) : "—";
        const status =
          (item.status ?? "pending")?.toString().replace(/_/g, " ") ??
          "Pending";
        rows.push({
          id: `${orderId}-${rows.length}`,
          orderId: String(orderId),
          products: Array.isArray(products)
            ? products.join(", ")
            : String(products),
          customer: String(customer),
          amount: Number(amount),
          date,
          status: status.charAt(0).toUpperCase() + status.slice(1),
        });
      };
      if (Array.isArray(data)) {
        data.forEach((item: any) => {
          if (item.orders && Array.isArray(item.orders)) {
            item.orders.forEach((ord: any) =>
              push({
                ...ord,
                products: item.name ?? item.design_name ?? ord.products,
              })
            );
          } else {
            push(item);
          }
        });
      }
      setOrders(rows);
      setCurrentPage(1);
    } catch {
      toast.error("Failed to load custom merch orders");
    } finally {
      setLoading(false);
    }
  }, []);

  const totalPages = Math.max(
    1,
    Math.ceil(orders.length / ORDERS_PER_PAGE)
  );

  return {
    orders,
    loading,
    currentPage,
    setCurrentPage,
    totalPages,
    ordersPerPage: ORDERS_PER_PAGE,
    loadOrders,
  };
}
