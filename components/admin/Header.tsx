"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useClickOutside } from "@/hooks/useCommon";
import { FaBell } from "react-icons/fa6";
import { useAuthStore } from "@/store/useAuthStore";
import { dashboardService } from "@/services/dashboard.service";
import { ApiNotification } from "@/types/admin.types";

interface HeaderProps {
  onMenuClick: () => void;
}

// const currencies = ["NGN (₦)"];

// Helper function to format time ago from a date string
const formatTimeAgo = (dateString?: string): string => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? "min" : "mins"} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? "day" : "days"} ago`;
    }
  } catch {
    return dateString;
  }
};

/** Convert age_in_hours (string) to timeline; show minutes when less than 1 hour */
const formatNotificationTime = (
  ageInHours?: string,
  createdAt?: string
): string => {
  if (ageInHours != null && ageInHours !== "") {
    const hours = parseFloat(ageInHours);
    if (!Number.isNaN(hours)) {
      if (hours < 1) {
        const minutes = Math.round(hours * 60);
        if (minutes < 1) return "Just now";
        return `${minutes} ${minutes === 1 ? "min" : "mins"} ago`;
      }
      if (hours < 24) {
        const h = Math.floor(hours);
        return `${h} ${h === 1 ? "hour" : "hours"} ago`;
      }
      const days = Math.floor(hours / 24);
      return `${days} ${days === 1 ? "day" : "days"} ago`;
    }
  }
  return formatTimeAgo(createdAt);
};

export default function Header({ onMenuClick }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCurrency, setShowCurrency] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Older");
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);

  const INITIAL_NOTIFICATIONS_COUNT = 3;
  const visibleNotifications = showAllNotifications
    ? notifications
    : notifications.slice(0, INITIAL_NOTIFICATIONS_COUNT);
  const hasMoreNotifications =
    notifications.length > INITIAL_NOTIFICATIONS_COUNT;
  const showShowAllButton = hasMoreNotifications && !showAllNotifications;
  // const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);

  const { user, isAuthenticated, logout } = useAuthStore();

  const notificationRef = useRef<HTMLDivElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useClickOutside(notificationRef, () => {
    setShowNotifications(false);
    setShowAllNotifications(false);
  });
  useClickOutside(currencyRef, () => setShowCurrency(false));
  useClickOutside(profileRef, () => setShowProfile(false));

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isAuthenticated) return;

      try {
        setLoadingNotifications(true);

        const orderingMap: Record<string, string> = {
          Today: "-created_at",
          Yesterday: "-created_at",
          "Last week": "-created_at",
          Older: "-created_at",
        };

        const ordering = orderingMap[activeFilter] || "-created_at";

        const data = await dashboardService.getNotifications({
          ordering,
        });
        setNotifications(data);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        setNotifications([]);
      } finally {
        setLoadingNotifications(false);
      }
    };

    fetchNotifications();
  }, [isAuthenticated, activeFilter]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-71.5 z-30 bg-white lg:pt-5">
      <div className="h-16 px-4 lg:mx-6 lg:px-6 flex items-center justify-between bg-admin-primary/4 rounded-md">
        <div className="flex items-center flex-1 max-w-md">
          <button
            onClick={onMenuClick}
            className="lg:hidden mr-4 text-grey hover:text-primary transition-colors"
          >
            <Menu size={24} />
          </button>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 bg-white rounded-lg transition-all"
            >
              <FaBell size={18} className="text-[#CACACA]/60" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-2.5 w-1.5 h-1.5 bg-red-600 text-white text-xs flex items-center justify-center rounded-full">
                  {/* {unreadCount} */}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute -right-15 sm:right-0 mt-2 w-[490px] bg-white rounded-lg shadow-lg z-50">
                {/* Header */}
                <div className="p-4 flex items-center justify-between border-b border-gray-100">
                  <h3 className="font-semibold text-lg text-gray-900">
                    Notifications
                  </h3>
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      setShowAllNotifications(false);
                    }}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={18} className="text-gray-500" />
                  </button>
                </div>

                {/* Filter Buttons and Mark All as Read */}
                <div className="px-4 pt-4 pb-3 flex items-end justify-between border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    {["Today", "Yesterday", "Last week", "Older"].map(
                      (filter) => (
                        <button
                          key={filter}
                          onClick={() => setActiveFilter(filter)}
                          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                            activeFilter === filter
                              ? "bg-gray-900 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {filter}
                        </button>
                      )
                    )}
                  </div>
                  {notifications.length > 0 && unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const ids = notifications.map((n) => n.id);
                          await dashboardService.markAllNotificationsAsRead(
                            ids
                          );
                          setNotifications((prev) =>
                            prev.map((n) => ({ ...n, is_read: true }))
                          );
                        } catch (err) {
                          console.error("Failed to mark all as read:", err);
                        }
                      }}
                      className="text-sm text-gray-900 hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                {/* Notifications List - scrollable only when "Show all" is expanded */}
                <div
                  className={
                    showAllNotifications
                      ? "max-h-96 overflow-y-auto"
                      : "overflow-hidden"
                  }
                >
                  {loadingNotifications ? (
                    <div className="px-4 py-8 text-center text-gray-500">
                      Loading notifications...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500">
                      No notifications found
                    </div>
                  ) : (
                    visibleNotifications.map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={async () => {
                          try {
                            await dashboardService.markNotificationAsRead(
                              notification.id
                            );
                            setNotifications((prev) =>
                              prev.map((n) =>
                                n.id === notification.id
                                  ? { ...n, is_read: true }
                                  : n
                              )
                            );
                          } catch (err) {
                            console.error(
                              "Failed to mark notification as read:",
                              err
                            );
                          }
                        }}
                        className={`w-full text-left px-4 py-3 relative transition-colors hover:bg-gray-50 ${
                          !notification.is_read ? "bg-blue-50" : "bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-gray-900 mb-1">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600 mb-1">
                              {notification.message}
                            </p>
                            <span className="text-sm text-gray-600">
                              {formatNotificationTime(
                                notification.age_in_hours,
                                notification.created_at
                              )}
                            </span>
                          </div>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 shrink-0" />
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>

                {/* Show all - only when there are more than 3 and not yet expanded */}
                {showShowAllButton && (
                  <div className="p-4 text-center border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setShowAllNotifications(true)}
                      className="text-sm text-gray-900 font-medium hover:text-gray-700"
                    >
                      Show all notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Profile or Sign In */}
          {user && isAuthenticated ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center space-x-3 px-3 py-2 hover:bg-accent-1 rounded-lg transition-all"
              >
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.firstName?.charAt(0) ||
                      user.email?.charAt(0).toUpperCase() ||
                      "A"}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className=" text-admin-primary/81">
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : "Admin User"}
                  </p>
                  <p className="text-sm text-admin-primary/50">{user.email}</p>
                </div>
              </button>

              {showProfile && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-accent-2 rounded-lg shadow-lg py-2 z-50">
                  <a
                    href="/admin/dashboard/settings"
                    className="block px-4 py-2 text-sm text-grey hover:bg-accent-1 hover:text-primary transition-colors"
                  >
                    Profile Settings
                  </a>
                  <button
                    onClick={async () => {
                      await logout();
                      window.location.href = "/admin/auth/login";
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <a
              href="/admin/auth/login"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all text-sm font-medium"
            >
              Sign In
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
