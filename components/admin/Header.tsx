"use client";

import { useState, useRef } from "react";
import { Menu } from "lucide-react";
import { useClickOutside } from "@/hooks/useCommon";
import { FaBell } from "react-icons/fa6";
import { useAuthStore } from "@/store/useAuthStore";

interface HeaderProps {
  onMenuClick: () => void;
}

// const currencies = ["NGN (₦)"];

const notifications = [
  {
    id: 1,
    title: "New Order #ORD-2024-003",
    message: "Order received from John Doe",
    time: "5 mins ago",
    unread: true,
  },
  {
    id: 2,
    title: "Low Stock Alert",
    message: "Faith Over Fear T-Shirt is running low",
    time: "1 hour ago",
    unread: true,
  },
  {
    id: 3,
    title: "Custom Merch Pending",
    message: "2 new custom designs awaiting review",
    time: "2 hours ago",
    unread: false,
  },
];

export default function Header({ onMenuClick }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCurrency, setShowCurrency] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  // const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);

  const { user, isAuthenticated, logout } = useAuthStore();

  const notificationRef = useRef<HTMLDivElement>(null);
  const currencyRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useClickOutside(notificationRef, () => setShowNotifications(false));
  useClickOutside(currencyRef, () => setShowCurrency(false));
  useClickOutside(profileRef, () => setShowProfile(false));

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 z-30 bg-white lg:pt-5">
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
              <div className="absolute -right-15 sm:right-0 mt-2 w-80 bg-white border border-accent-2 rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-accent-2">
                  <h3 className="font-semibold text-primary">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-accent-2 hover:bg-accent-1 transition-colors cursor-pointer ${
                        notification.unread ? "bg-blue-50" : ""
                      }`}
                    >
                      <h4 className="text-sm font-semibold text-primary mb-1">
                        {notification.title}
                      </h4>
                      <p className="text-xs text-grey mb-1">
                        {notification.message}
                      </p>
                      <span className="text-xs text-grey">
                        {notification.time}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="p-3 text-center border-t border-accent-2">
                  <button className="text-sm text-primary hover:underline font-medium">
                    View All Notifications
                  </button>
                </div>
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
