"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Button,
  Badge,
  LoadingSpinner,
  EmptyState,
} from "@/components/admin/ui";
import {
  Order,
  OrderStatus,
  ApiOrder,
  ProductCategory,
  PaymentStatus,
} from "@/types/admin.types";
import { dashboardService } from "@/services/dashboard.service";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getStatusColor,
} from "@/lib/utils";
import toast from "react-hot-toast";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [tempStatus, setTempStatus] = useState<OrderStatus>("placed");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const inferCategory = (productName: string): ProductCategory => {
    const nameLower = productName.toLowerCase();
    if (nameLower.includes("shirt") || nameLower.includes("tee"))
      return "Shirts";
    if (nameLower.includes("cap")) return "Caps";
    if (nameLower.includes("hoodie")) return "Hoodie";
    if (nameLower.includes("headband")) return "Headband";
    if (nameLower.includes("hat")) return "Hat";
    if (nameLower.includes("jacket")) return "Jackets";
    return "Shirts";
  };

  const normalizeStatus = (status: string): OrderStatus => {
    const statusLower = status.toLowerCase();
    // API status values: placed, payment_confirmed, processing, shipped, out_for_delivery, delivered, cancelled, backordered
    if (
      [
        "placed",
        "payment_confirmed",
        "processing",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "backordered",
      ].includes(statusLower)
    ) {
      return statusLower as OrderStatus;
    }
    return "placed"; // Default fallback
  };

  const normalizePaymentStatus = (status: string | undefined): PaymentStatus => {
    if (!status) return "pending";
    const statusLower = status.toLowerCase();
    if (statusLower === "paid" || statusLower === "completed") return "completed";
    if (statusLower === "pending" || statusLower === "unpaid") return "pending";
    if (statusLower === "failed") return "failed";
    if (statusLower === "refunded") return "refunded";
    return "pending";
  };

  const transformApiOrderToOrder = useCallback((apiOrder: ApiOrder): Order => {
    // Extract user information
    let userId = "";
    let userName = "";
    let userEmail = "";

    if (apiOrder.user) {
      if (typeof apiOrder.user === "object") {
        userId = apiOrder.user.id || "";
        userEmail = apiOrder.user.email || "";
        userName =
          `${apiOrder.user.first_name || ""} ${apiOrder.user.last_name || ""}`.trim() ||
          apiOrder.user.email ||
          "";
      } else {
        userId = apiOrder.user;
      }
    }

    // Fallback to direct fields or guest
    userName =
      userName ||
      apiOrder.user_name ||
      userEmail ||
      apiOrder.user_email ||
      apiOrder.guest_email ||
      "Guest";
    userEmail = userEmail || apiOrder.user_email || apiOrder.guest_email || "";

    return {
      id: apiOrder.id.toString(),
      userId: userId,
      userName: userName,
      userEmail: userEmail,
      items:
        apiOrder.items?.map((item) => ({
          productId: item.id.toString(),
          productName: item.product_name,
          category: inferCategory(item.product_name),
          quantity: item.quantity,
          price: parseFloat(item.price) || 0,
        })) || [],
      itemsCount: apiOrder.items_count || apiOrder.items?.length || 0,
      totalAmount: parseFloat(apiOrder.total) || 0,
      status: normalizeStatus(apiOrder.status),
      paymentMethod:
        apiOrder.payment_method?.toLowerCase() === "paystack" ||
        apiOrder.payment_method?.toLowerCase() === "flutterwave"
          ? (apiOrder.payment_method.toLowerCase() as
              | "paystack"
              | "flutterwave")
          : "paystack",
      paymentStatus: normalizePaymentStatus(apiOrder.payment_status),
      deliveryAddress:
        apiOrder.shipping_full_address ||
        apiOrder.shipping_address ||
        "",
      orderDate: apiOrder.created_at,
      createdAt: apiOrder.created_at,
    };
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      const apiOrders = await dashboardService.getOrders();
      const transformedOrders = apiOrders.map(transformApiOrderToOrder);
      setOrders(transformedOrders);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [transformApiOrderToOrder]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleViewOrder = async (order: Order) => {
    setLoadingOrder(true);
    setShowOrderDetails(true);
    try {
      const apiOrder = await dashboardService.getOrderById(order.id);
      const transformedOrder = transformApiOrderToOrder(apiOrder);
      setSelectedOrder(transformedOrder);
      setTempStatus(transformedOrder.status);
    } catch (error) {
      console.error("Error loading order details:", error);
      toast.error("Failed to load order details");
      setShowOrderDetails(false);
    } finally {
      setLoadingOrder(false);
    }
  };

  const handleBackToList = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;

    try {
      // TODO: Implement update order status API endpoint
      // await dashboardService.updateOrderStatus(selectedOrder.id, tempStatus);
      setOrders(
        orders.map((o) =>
          o.id === selectedOrder.id ? { ...o, status: tempStatus } : o
        )
      );
      setSelectedOrder({ ...selectedOrder, status: tempStatus });
      handleBackToList();
      toast.success("Order status updated");
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      // Map status filter to API status format
      let apiStatus: string | undefined;
      if (statusFilter !== "all") {
        apiStatus = statusFilter;
      }

      const blob = await dashboardService.exportOrders({
        search: searchQuery || undefined,
        status: apiStatus,
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `orders-export-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Orders exported successfully");
    } catch (error) {
      console.error("Error exporting orders:", error);
      toast.error("Failed to export orders");
    } finally {
      setExporting(false);
    }
  };

  const filteredOrders = orders
    .filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.userName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (filterStatus === "date") {
        return (
          new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        );
      } else if (filterStatus === "name") {
        return a.userName.localeCompare(b.userName);
      } else if (filterStatus === "status") {
        return a.status.localeCompare(b.status);
      } else if (filterStatus === "payment") {
        return a.paymentStatus.localeCompare(b.paymentStatus);
      }
      return 0;
    });

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, filterStatus]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const formatStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      placed: "Placed",
      payment_confirmed: "Payment Confirmed",
      processing: "Processing",
      shipped: "Shipped",
      out_for_delivery: "Out for Delivery",
      delivered: "Delivered",
      cancelled: "Cancelled",
      backordered: "Backordered",
    };
    return (
      statusMap[status] ||
      status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    );
  };

  const orderCounts = {
    all: orders.length,
    placed: orders.filter(
      (o) =>
        o.status === "placed" ||
        o.status === "payment_confirmed" ||
        o.status === "backordered"
    ).length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter(
      (o) => o.status === "shipped" || o.status === "out_for_delivery"
    ).length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
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
      <div className="mb-6">
        <h1 className="text-xl lg:text-2xl font-bold text-admin-primary">
          Order Management
        </h1>
        <p className=" text-admin-primary">
          Track and manage all your customer orders
        </p>
      </div>

            {showOrderDetails ? (
                <div className="bg-admin-primary/4 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={handleBackToList}
                            className="flex items-center space-x-2 text-admin-primary hover:text-admin-primary/80 transition-colors"
                        >
                            <ChevronLeft size={20} />
                            <h2 className="text-lg font-medium text-admin-primary">Order Details</h2>
                        </button>
                    </div>

          {loadingOrder ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <LoadingSpinner size="lg" />
            </div>
          ) : selectedOrder ? (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-admin-primary mb-3">
                Personal Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-grey mb-1">Name</p>
                  <p className="text-admin-primary font-medium">
                    {selectedOrder.userName}
                  </p>
                </div>
                <div>
                  <p className="text-grey mb-1">Email</p>
                  <p className="text-admin-primary font-medium">
                    {selectedOrder.userEmail}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-admin-primary mb-3">
                Order Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-grey mb-1">Order ID</p>
                  <p className="text-admin-primary font-medium">
                    {selectedOrder.id}
                  </p>
                </div>
                <div>
                  <p className="text-grey mb-1">Order Date</p>
                  <p className="text-admin-primary font-medium">
                    {formatDateTime(selectedOrder.orderDate)}
                  </p>
                </div>
                <div>
                  <p className="text-grey mb-1">Payment Status</p>
                  <Badge
                    variant={
                      selectedOrder.paymentStatus === "completed"
                        ? "success"
                        : "warning"
                    }
                  >
                    {selectedOrder.paymentStatus}
                  </Badge>
                </div>
                <div>
                  <p className="text-grey mb-1">Payment Method</p>
                  <p className="text-admin-primary font-medium capitalize">
                    {selectedOrder.paymentMethod}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-grey mb-1">Delivery Address</p>
                  <p className="text-admin-primary font-medium">
                    {selectedOrder.deliveryAddress}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-admin-primary mb-3">
                Order Items
              </h3>
              <div className="border border-accent-2 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-accent-1">
                    <tr>
                      <th className="text-left text-xs font-semibold text-grey px-4 py-3">
                        Product
                      </th>
                      <th className="text-left text-xs font-semibold text-grey px-4 py-3">
                        Category
                      </th>
                      <th className="text-left text-xs font-semibold text-grey px-4 py-3">
                        Quantity
                      </th>
                      <th className="text-left text-xs font-semibold text-grey px-4 py-3">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, index) => (
                      <tr key={index} className="border-t border-accent-2">
                        <td className="px-4 py-3 text-sm text-admin-primary">
                          {item.productName}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="info">{item.category}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-admin-primary">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-admin-primary">
                          {formatCurrency(item.price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-between items-center bg-accent-1 p-4 rounded-lg">
                <span className="font-semibold text-admin-primary">
                  Total Amount
                </span>
                <span className="text-xl font-bold text-admin-primary">
                  {formatCurrency(selectedOrder.totalAmount)}
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-admin-primary mb-3">
                Update Status
              </h3>
              <div className="flex flex-wrap gap-3">
                {[
                  { value: "pending", label: "Pending" },
                  { value: "processing", label: "Processing" },
                  { value: "shipped", label: "Shipped" },
                  { value: "delivered", label: "Delivered" },
                  { value: "cancelled", label: "Cancelled" },
                ].map((status) => (
                  <button
                    key={status.value}
                    type="button"
                    onClick={() => setTempStatus(status.value as OrderStatus)}
                    className={`px-6 py-2 rounded-md border transition-all ${
                      tempStatus === status.value
                        ? "border-[#A1CBFF] text-[#3291FF] bg-secondary"
                        : "border-admin-primary/35 text-admin-primary"
                    }`}
                  >
                    {status.label}
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
              <Button type="button" onClick={handleUpdateOrder}>
                Update Order
              </Button>
            </div>
          </div>
          ) : (
            <div className="text-center py-8 text-admin-primary">
              <p>Order not found</p>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="bg-admin-primary/4 rounded-t-xl p-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2 bg-white p-1">
                {[
                  { key: "all", label: "All Orders" },
                  { key: "placed", label: "Placed" },
                  { key: "processing", label: "Processing" },
                  { key: "shipped", label: "Shipped" },
                  { key: "delivered", label: "Delivered" },
                  { key: "cancelled", label: "Cancelled" },
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setStatusFilter(filter.key as any)}
                    className={`px-4 py-2 rounded-sm text-sm transition-all flex items-center ${
                      statusFilter === filter.key
                        ? "bg-admin-primary text-white"
                        : "bg-admin-primary/5 text-admin-primary"
                    }`}
                  >
                    <span>{filter.label}</span>
                    <span>
                      ({orderCounts[filter.key as keyof typeof orderCounts]})
                    </span>
                  </button>
                ))}
              </div>
              <Button onClick={handleExport} disabled={exporting}>
                {exporting ? "Exporting..." : "Export"}
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-admin-primary/4 p-6">
            <div>
              <h2 className="text-sm text-admin-primary/60 mb-1">
                Total Orders
              </h2>
              <p className="text-2xl font-bold text-admin-primary">
                {filteredOrders.length}
              </p>
            </div>
            <div className="flex gap-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-grey"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search by Orders ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white rounded-lg focus:outline-none sm:w-96"
                />
              </div>

              <div className="relative">
                <button
                  onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg border border-accent-2 transition-colors"
                >
                  <Filter size={18} className="text-admin-primary" />
                  <span className="text-admin-primary">Filter</span>
                </button>
                {filterDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-accent-2 z-10">
                    <div className="p-2">
                      <p className="px-3 py-2 text-sm font-medium text-grey">
                        Filter By
                      </p>
                      {["date", "name", "status", "payment"].map((status) => (
                        <button
                          key={status}
                          onClick={() => {
                            setFilterStatus(status);
                            setFilterDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-accent-1 transition-colors capitalize ${
                            filterStatus === status
                              ? "bg-accent-1 text-admin-primary font-medium"
                              : "text-grey"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-admin-primary/4 rounded-b-xl overflow-hidden">
            {filteredOrders.length === 0 ? (
              <EmptyState
                title="No orders found"
                description="Try adjusting your filters or search criteria"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-accent-1 border-b border-accent-2">
                    <tr>
                      <th className="text-left font-medium text-admin-primary px-6 py-4">
                        Order ID
                      </th>
                      <th className="text-left font-medium text-admin-primary px-6 py-4">
                        Products
                      </th>
                      <th className="text-left font-medium text-admin-primary px-6 py-4">
                        User Name
                      </th>
                      <th className="text-left font-medium text-admin-primary px-6 py-4">
                        Amount
                      </th>
                      <th className="text-left font-medium text-admin-primary px-6 py-4">
                        Date
                      </th>
                      <th className="text-left font-medium text-admin-primary px-6 py-4">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedOrders.map((order) => (
                      <tr
                        key={order.id}
                        onClick={() => handleViewOrder(order)}
                        className="border-b border-accent-2 transition-colors bg-white cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <p className="text-admin-primary">{order.id}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-admin-primary">
                            {order.itemsCount ?? order.items.length}{" "}
                            {(order.itemsCount ?? order.items.length) === 1
                              ? "item"
                              : "items"}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-admin-primary">{order.userName}</p>
                        </td>
                        <td className="px-6 py-4 text-admin-primary">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="px-6 py-4 text-admin-primary">
                          {formatDate(order.orderDate)}
                        </td>
                        <td className="px-6 py-4">
                          <div
                            className={`px-3 py-1 rounded-lg w-28 flex items-center justify-center border-0 ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {formatStatusLabel(order.status)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {filteredOrders.length > 0 && totalPages > 1 && (
              <div className="bg-white border-t border-accent-2 px-6 py-4 flex items-center justify-between">
                <div className="text-sm text-admin-primary">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredOrders.length)} of{" "}
                  {filteredOrders.length} orders
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
                        const showEllipsisBefore = index > 0 && array[index - 1] !== page - 1;
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
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
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
          </div>
        </>
      )}
    </div>
  );
}
