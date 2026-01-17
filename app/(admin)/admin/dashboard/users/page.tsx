"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  // Eye,
  // Download,
  // Ban,
  // CheckCircle,
  // Send,
  Filter,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  // ShoppingBag,
  // DollarSign,
  // Bookmark,
} from "lucide-react";
import {
  Button,
  Modal,
  Badge,
  LoadingSpinner,
  // Input,
  // Textarea,
} from "@/components/admin/ui";
import {
  User,
  // SupportTicket,
  Order,
  OrderStatus,
  ApiUser,
} from "@/types/admin.types";
import { apiService } from "@/services/mock.service";
import { dashboardService } from "@/services/dashboard.service";
import { formatCurrency, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
// import { PiShoppingBagDuotone } from "react-icons/pi";
import { CgShoppingBag } from "react-icons/cg";
import { CiHeart } from "react-icons/ci";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedApiUser, setSelectedApiUser] = useState<ApiUser | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspending, setSuspending] = useState(false);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const transformApiUserToUser = (apiUser: ApiUser): User => {
    // Calculate orders count and total spent from orders array if available
    let ordersCount = parseInt(apiUser.total_orders) || 0;
    let amountSpent = parseFloat(apiUser.total_spent) || 0;

    if (apiUser.orders && apiUser.orders.length > 0) {
      ordersCount = apiUser.orders.length;
      amountSpent = apiUser.orders.reduce((sum, order) => {
        const orderTotal = typeof order.total === 'number' ? order.total : parseFloat(order.total) || 0;
        return sum + orderTotal;
      }, 0);
    }

    return {
      id: apiUser.id,
      name:
        `${apiUser.first_name} ${apiUser.last_name}`.trim() || apiUser.email,
      email: apiUser.email,
      image: undefined, // Not provided by API
      role: "staff", // Default role, not provided by API
      status: apiUser.is_active ? "active" : "inactive",
      ordersCount,
      amountSpent,
      lastActive: apiUser.last_login || apiUser.date_joined,
      createdAt: apiUser.date_joined,
    };
  };

  const loadData = useCallback(async () => {
    try {
      const usersData = await dashboardService.getUsers();
      const transformedUsers = usersData.map(transformApiUserToUser);
      setUsers(transformedUsers);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleViewUser = async (user: User) => {
    setLoadingUser(true);
    setShowUserDetails(true);
    try {
      const apiUser = await dashboardService.getUserById(user.id);
      const transformedUser = transformApiUserToUser(apiUser);
      setSelectedUser(transformedUser);
      setSelectedApiUser(apiUser); // Store full API user data with orders
    } catch (error) {
      console.error("Error loading user details:", error);
      toast.error("Failed to load user details");
      setShowUserDetails(false);
    } finally {
      setLoadingUser(false);
    }
  };

  const handleBackToList = () => {
    setShowUserDetails(false);
    setSelectedUser(null);
    setSelectedApiUser(null);
  };

  const handleSuspendUser = () => {
    if (selectedUser) {
      setShowSuspendModal(true);
    }
  };

  const handleConfirmSuspend = async () => {
    if (!selectedUser) return;

    setSuspending(true);
    try {
      await dashboardService.suspendUser(selectedUser.id);
      
      // Update users list
      setUsers(
        users.map((u) =>
          u.id === selectedUser.id ? { ...u, status: "inactive" as any } : u
        )
      );

      // Reload user details from API to get updated data
      try {
        const apiUser = await dashboardService.getUserById(selectedUser.id);
        const transformedUser = transformApiUserToUser(apiUser);
        setSelectedUser(transformedUser);
        setSelectedApiUser(apiUser);
      } catch (error) {
        console.error("Error reloading user details:", error);
        // Fallback to local update if API call fails
        setSelectedUser({ ...selectedUser, status: "inactive" as any });
      }

      toast.success("User suspended successfully");
      setShowSuspendModal(false);
    } catch (error: any) {
      console.error("Error suspending user:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to suspend user";
      toast.error(errorMessage);
    } finally {
      setSuspending(false);
    }
  };

  const handleActivateUser = async () => {
    if (!selectedUser) return;

    try {
      // Note: If there's an activate endpoint, use it here
      // For now, we'll use the mock service as a fallback
      await apiService.updateUserStatus(selectedUser.id, "active");
      
      setUsers(
        users.map((u) =>
          u.id === selectedUser.id ? { ...u, status: "active" as any } : u
        )
      );

      // Reload user details from API to get updated data
      try {
        const apiUser = await dashboardService.getUserById(selectedUser.id);
        const transformedUser = transformApiUserToUser(apiUser);
        setSelectedUser(transformedUser);
        setSelectedApiUser(apiUser);
      } catch (error) {
        console.error("Error reloading user details:", error);
        setSelectedUser({ ...selectedUser, status: "active" as any });
      }

      toast.success("User activated successfully");
    } catch (error) {
      console.error("Error activating user:", error);
      toast.error("Failed to activate user");
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      // Map status filter to API is_active format
      let isActive: boolean | undefined;
      if (statusFilter === "active") {
        isActive = true;
      } else if (statusFilter === "inactive") {
        isActive = false;
      }

      const blob = await dashboardService.exportUsers({
        search: searchQuery || undefined,
        is_active: isActive,
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `users-export-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Users exported successfully");
    } catch (error) {
      console.error("Error exporting users:", error);
      toast.error("Failed to export users");
    } finally {
      setExporting(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery]);

  const transformApiOrderToOrder = (apiOrder: any): Order => {
    return {
      id: apiOrder.id.toString(),
      userId: selectedUser?.id || "",
      userName: selectedUser?.name || "",
      userEmail: selectedUser?.email || "",
      items: [],
      itemsCount: apiOrder.items_count || 0,
      totalAmount: typeof apiOrder.total === 'number' ? apiOrder.total : parseFloat(apiOrder.total) || 0,
      status: apiOrder.status as OrderStatus,
      paymentMethod: "stripe",
      paymentStatus: "pending",
      deliveryAddress: "",
      orderDate: apiOrder.created_at,
      createdAt: apiOrder.created_at,
    };
  };

  const getUserOrders = (): Order[] => {
    if (selectedApiUser?.orders && selectedApiUser.orders.length > 0) {
      return selectedApiUser.orders
        .slice(0, 5)
        .map(transformApiOrderToOrder);
    }
    return [];
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // const userCounts = {
  //   all: users.length,
  //   active: users.filter((u) => u.status === "active").length,
  //   inactive: users.filter((u) => u.status === "inactive").length,
  //   flagged: users.filter((u) => u.status === "flagged").length,
  // };

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
          User Management
        </h1>
        <p className="text-sm text-admin-primary">
          Manage users and customer relationships
        </p>
      </div>

      {showUserDetails ? (
        <div className="bg-admin-primary/4 rounded-xl p-6">
          <div className="flex items-center gap-5 mb-6">
            <button
              onClick={handleBackToList}
              className="flex items-center space-x-2 text-admin-primary hover:text-admin-primary/80 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className=" font-medium text-admin-primary">User Details</h2>
          </div>

          {loadingUser ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <LoadingSpinner size="lg" />
            </div>
          ) : selectedUser ? (
            <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-accent-1 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-admin-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {getInitials(selectedUser.name)}
                  </span>
                </div>
                <div>
                  <p className="text-lg font-semibold text-admin-primary">
                    {selectedUser.name}
                  </p>
                  <p className="text-sm text-grey">{selectedUser.email}</p>
                </div>
              </div>
              <Badge
                variant={
                  selectedUser.status === "active"
                    ? "success"
                    : selectedUser.status === "flagged"
                    ? "warning"
                    : "default"
                }
              >
                {selectedUser.status}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-4 bg-[#DADADA]/40">
              <div className="p-4 rounded-lg">
                <div className="flex items-center justify-start mb-2">
                  <CgShoppingBag size={20} className="text-admin-primary/65" />
                  <span className="ml-1 text-sm text-grey">Order</span>
                </div>
                <p className="text-2xl font-bold text-admin-primary">
                  {selectedApiUser?.orders 
                    ? selectedApiUser.orders.length 
                    : selectedUser.ordersCount}
                </p>
              </div>
              <div className="p-4 rounded-lg text-center">
                <div className="flex items-center justify-center mb-2">
                  <span className="ml-2 text-sm text-grey">Total Spent</span>
                </div>
                <p className="text-2xl font-bold text-admin-primary">
                  {formatCurrency(
                    selectedApiUser?.orders && selectedApiUser.orders.length > 0
                      ? selectedApiUser.orders.reduce((sum, order) => {
                          const orderTotal = typeof order.total === 'number' 
                            ? order.total 
                            : parseFloat(order.total) || 0;
                          return sum + orderTotal;
                        }, 0)
                      : selectedUser.amountSpent
                  )}
                </p>
              </div>
              <div className="p-4 rounded-lg text-right">
                <div className="flex items-center justify-end mb-2">
                  <CiHeart size={20} className="text-admin-primary/65" />
                  <span className="ml-2 text-sm text-grey">Saved</span>
                </div>
                <p className="text-2xl font-bold text-admin-primary">0</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-admin-primary mb-3">
                Recent Order History
              </h3>
              <div className="space-y-3 bg-[#DADADA]/40">
                {getUserOrders().length > 0 ? (
                  getUserOrders().map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-admin-primary mb-2">
                        #Order {order.id}
                      </p>
                      <p className="text-sm text-grey">
                        {formatDate(order.orderDate)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className=" text-admin-primary mb-2">
                        {formatCurrency(order.totalAmount)}
                      </p>
                      <Badge
                        variant={
                          order.status === "delivered"
                            ? "success"
                            : order.status === "placed" ||
                              order.status === "payment_confirmed" ||
                              order.status === "backordered"
                            ? "warning"
                            : order.status === "shipped" ||
                              order.status === "out_for_delivery"
                            ? "info"
                            : "default"
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-grey">
                    <p>No orders found</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-admin-primary mb-3">
                Account Actions
              </h3>
              <div className="flex gap-4">
                {selectedUser.status === "active" ? (
                  <button
                    onClick={handleSuspendUser}
                    className="flex items-center space-x-2 px-6 py-2 border-2 border-[#CA0F04] text-[#CA0F04] rounded-lg bg-[#CA0F04]/7 transition-colors hover:bg-[#CA0F04]/10"
                  >
                    <span>Suspend</span>
                  </button>
                ) : (
                  <button
                    onClick={handleActivateUser}
                    className="flex items-center space-x-2 px-6 py-2 border-2 border-admin-primary/35 text-admin-primary rounded-lg transition-colors hover:bg-admin-primary/5"
                  >
                    <span>Activate</span>
                  </button>
                )}
              </div>
            </div>
            </div>
          ) : (
            <div className="text-center py-8 text-admin-primary">
              <p>User not found</p>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="bg-admin-primary/4 rounded-t-xl p-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2 bg-white p-1">
                <button className="px-4 py-2 rounded-sm text-sm transition-all flex items-center bg-admin-primary text-white">
                  <span>All Users</span>
                  <span className="ml-1">({users.length})</span>
                </button>
              </div>
              <Button onClick={handleExport} disabled={exporting}>
                {exporting ? "Exporting..." : "Export"}
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-admin-primary/4 p-6 gap-4">
            <div>
              <h2 className="text-sm text-admin-primary/60 mb-1">All Users</h2>
              <p className="text-2xl font-bold text-admin-primary">
                {filteredUsers.length}
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
                  placeholder="Search by user name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white rounded-lg focus:outline-none sm:w-96 border-accent-2"
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
                      {["all", "active", "inactive", "flagged"].map(
                        (status) => (
                          <button
                            key={status}
                            onClick={() => {
                              setStatusFilter(status);
                              setFilterDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-accent-1 transition-colors capitalize ${
                              statusFilter === status
                                ? "bg-accent-1 text-admin-primary font-medium"
                                : "text-grey"
                            }`}
                          >
                            {status}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-admin-primary/4 rounded-b-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-accent-1 shadow-md shadow-black">
                  <tr>
                    <th className="text-left font-medium text-admin-primary px-6 py-4">
                      User
                    </th>
                    <th className="text-left font-medium text-admin-primary px-6 py-4">
                      Orders
                    </th>
                    <th className="text-left font-medium text-admin-primary px-6 py-4">
                      Amount Spent
                    </th>
                    <th className="text-left font-medium text-admin-primary px-6 py-4">
                      Last Active
                    </th>
                    <th className="text-left font-medium text-admin-primary px-6 py-4">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() => handleViewUser(user)}
                      className="border-b border-accent-2 transition-colors bg-white cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <p className=" text-admin-primary">{user.name}</p>
                      </td>
                      <td className="px-6 py-4 text-admin-primary">
                        {user.ordersCount}
                      </td>
                      <td className="px-6 py-4 text-admin-primary">
                        {formatCurrency(user.amountSpent)}
                      </td>
                      <td className="px-6 py-4 text-grey">
                        {formatDate(user.lastActive)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            user.status === "active"
                              ? "success"
                              : user.status === "flagged"
                              ? "warning"
                              : "default"
                          }
                        >
                          {user.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          {filteredUsers.length > 0 && (
            <div className="bg-admin-primary/4 p-4 rounded-b-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-admin-primary/60">
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, filteredUsers.length)} of{" "}
                {filteredUsers.length} users
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

      <Modal
        isOpen={showSuspendModal}
        onClose={() => !suspending && setShowSuspendModal(false)}
        title="Suspend User"
        size="md"
      >
        <div className="py-6">
          <div className="mb-6">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-admin-primary mb-2 text-center">
              Are you sure you want to suspend this user?
            </h3>
            <p className="text-grey text-center">
              {selectedUser && (
                <>
                  This will suspend <strong>{selectedUser.name}</strong> (
                  {selectedUser.email}). The user will not be able to access
                  their account until reactivated.
                </>
              )}
            </p>
          </div>
          <div className="flex justify-center space-x-4">
            <Button
              variant="secondary"
              onClick={() => setShowSuspendModal(false)}
              disabled={suspending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmSuspend}
              disabled={suspending}
              className="bg-[#CA0F04] hover:bg-[#CA0F04]/90 text-white"
            >
              {suspending ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Suspending...
                </span>
              ) : (
                "Suspend User"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
