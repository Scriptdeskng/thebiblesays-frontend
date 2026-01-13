"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Eye,
  Download,
  Ban,
  CheckCircle,
  Send,
  Filter,
  ArrowLeft,
  ShoppingBag,
  DollarSign,
  Bookmark,
} from "lucide-react";
import {
  Button,
  Modal,
  Badge,
  LoadingSpinner,
  Input,
  Textarea,
} from "@/components/admin/ui";
import { User, SupportTicket, Order, ApiUser } from "@/types/admin.types";
import { mockOrders, apiService } from "@/services/mock.service";
import { dashboardService } from "@/services/dashboard.service";
import { formatCurrency, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { PiShoppingBagDuotone } from "react-icons/pi";
import { CgShoppingBag } from "react-icons/cg";
import { CiHeart } from "react-icons/ci";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const transformApiUserToUser = (apiUser: ApiUser): User => {
    return {
      id: apiUser.id,
      name:
        `${apiUser.first_name} ${apiUser.last_name}`.trim() || apiUser.email,
      email: apiUser.email,
      image: undefined, // Not provided by API
      role: "staff", // Default role, not provided by API
      status: apiUser.is_active ? "active" : "inactive",
      ordersCount: parseInt(apiUser.total_orders) || 0,
      amountSpent: parseFloat(apiUser.total_spent) || 0,
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

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const handleBackToList = () => {
    setShowUserDetails(false);
    setSelectedUser(null);
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      await apiService.updateUserStatus(userId, newStatus);
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, status: newStatus as any } : u
        )
      );
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, status: newStatus as any });
        handleBackToList();
      }
    } catch (error) {
      console.error("Error updating user status:", error);
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

  const getUserOrders = (userId: string): Order[] => {
    return mockOrders.filter((o) => o.userId === userId).slice(0, 5);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const userCounts = {
    all: users.length,
    active: users.filter((u) => u.status === "active").length,
    inactive: users.filter((u) => u.status === "inactive").length,
    flagged: users.filter((u) => u.status === "flagged").length,
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
          User Management
        </h1>
        <p className="text-sm text-admin-primary">
          Manage users and customer relationships
        </p>
      </div>

      {showUserDetails && selectedUser ? (
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
                  {selectedUser.ordersCount}
                </p>
              </div>
              <div className="p-4 rounded-lg text-center">
                <div className="flex items-center justify-center mb-2">
                  <span className="ml-2 text-sm text-grey">Total Spent</span>
                </div>
                <p className="text-2xl font-bold text-admin-primary">
                  {formatCurrency(selectedUser.amountSpent)}
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
                {getUserOrders(selectedUser.id).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-admin-primary mb-2">
                        {order.id}
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
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-admin-primary mb-3">
                Account Actions
              </h3>
              <div className="flex gap-4">
                {selectedUser.status === "active" ? (
                  <button
                    onClick={() =>
                      handleStatusChange(selectedUser.id, "inactive")
                    }
                    className="flex items-center space-x-2 px-6 py-2 border-2 border-[#CA0F04] text-[#CA0F04] rounded-lg bg-[#CA0F04]/7 transition-colors"
                  >
                    <span>Suspend</span>
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      handleStatusChange(selectedUser.id, "active")
                    }
                    className="flex items-center space-x-2 px-6 py-2 border-2 border-admin-primary/35 text-admin-primary rounded-lg transition-colors"
                  >
                    <span>Activate</span>
                  </button>
                )}
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
              <Button type="button">Edit User</Button>
            </div>
          </div>
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
                  {filteredUsers.map((user) => (
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
        </>
      )}
    </div>
  );
}
