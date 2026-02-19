"use client";

import { formatCurrency } from "@/lib/utils";
import type { CustomMerchOrderRow } from "../types";
import clsx from "clsx";

interface CustomMerchOrdersTabProps {
  orders: CustomMerchOrderRow[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  ordersPerPage?: number;
  onPageChange: (page: number) => void;
  onOrderClick?: (order: CustomMerchOrderRow) => void;
}

export default function CustomMerchOrdersTab({
  orders,
  loading,
  currentPage,
  totalPages,
  ordersPerPage = 10,
  onPageChange,
  onOrderClick,
}: CustomMerchOrdersTabProps) {
  const start = (currentPage - 1) * ordersPerPage;
  const paginatedOrders = orders.slice(start, start + ordersPerPage);

  return (
    <div className="overflow-hidden">
      <div className="py-3">
        <h2 className="text-lg font-semibold text-admin-primary">
          Custom merch orders
        </h2>
        <p className="text-sm text-admin-primary/70 mt-0.5">
          Monitor custom orders and their specific design
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="">
            <tr>
              <th className="text-left text-sm font-medium text-admin-primary pr-4 py-4">
                Order ID
              </th>
              <th className="text-left text-sm font-medium text-admin-primary pr-4 py-4">
                Products
              </th>
              <th className="text-left text-sm font-medium text-admin-primary pr-4 py-4">
                Customer
              </th>
              <th className="text-left text-sm font-medium text-admin-primary pr-4 py-4">
                Amount
              </th>
              <th className="text-left text-sm font-medium text-admin-primary pr-4 py-4">
                Date
              </th>
              <th className="text-left text-sm font-medium text-admin-primary pr-4 py-4">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-admin-primary/60"
                >
                  Loading...
                </td>
              </tr>
            ) : paginatedOrders.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-admin-primary/60"
                >
                  No orders yet
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order, index) => (
                <tr
                  key={order.id}
                  role={onOrderClick ? "button" : undefined}
                  onClick={onOrderClick ? () => onOrderClick(order) : undefined}
                  className={clsx(
                    "border-b border-accent-2 hover:bg-admin-primary/5",
                    index % 2 === 0 ? "bg-accent-1" : "",
                    onOrderClick && "cursor-pointer"
                  )}
                >
                  <td className="pr-4 py-4 text-admin-primary font-medium">
                    {order.orderId}
                  </td>
                  <td className="pr-4 py-4 text-admin-primary">
                    {order.products}
                  </td>
                  <td className="pr-4 py-4 text-admin-primary">
                    {order.customer}
                  </td>
                  <td className="pr-4 py-4 text-admin-primary">
                    {formatCurrency(order.amount)}
                  </td>
                  <td className="pr-4 py-4 text-admin-primary">{order.date}</td>
                  <td className="pr-4 py-4">
                    <span
                      className={clsx(
                        "inline-flex items-center px-2.5 py-1 rounded-full text-sm",
                        order.status.toLowerCase() === "approved"
                          ? "bg-green-500/10 text-green-700 dark:text-green-700"
                          : "bg-admin-primary/10 text-admin-primary/80"
                      )}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {paginatedOrders.length > 0 && (
        <div className="flex items-center justify-between py-4 border-t border-accent-2">
          <span className="text-sm text-admin-primary/60">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-lg border border-accent-2 text-sm font-medium text-admin-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-admin-primary/5"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`w-9 h-9 rounded-lg border text-sm font-medium transition-colors ${
                  currentPage === p
                    ? "bg-admin-primary text-white border-admin-primary"
                    : "border-accent-2 text-admin-primary hover:bg-admin-primary/5"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() =>
                onPageChange(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-lg border border-accent-2 text-sm font-medium text-admin-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-admin-primary/5"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
