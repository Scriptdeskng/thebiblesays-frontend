/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import { useAuthStore } from "@/store/useAuthStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { isAuthenticated, accessToken } = useAuthStore();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!accessToken && hasMounted) {
      router.push("/admin/auth/login");
    }
  }, [router, accessToken, hasMounted]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-72">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="pt-16 flex-1 min-h-screen sm:pt-20 lg:pt-24">
          <div className="p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
