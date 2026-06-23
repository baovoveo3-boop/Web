"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login?redirect=/admin");
      } else if (userData && userData.role !== "admin" && userData.role !== "super_admin") {
        router.push("/");
      }
    }
  }, [user, userData, loading, router]);

  // Loading state wrapper
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-zinc-400">Đang tải cấu hình quản trị...</p>
        </div>
      </div>
    );
  }

  // Not logged in or not admin - return blank during redirection
  if (!user || (userData && userData.role !== "admin" && userData.role !== "super_admin")) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100">
      <Header />
      <div className="flex flex-1 max-w-7xl w-full mx-auto p-4 md:px-8 gap-6">
        {/* Sidebar Navigation */}
        <aside className="w-64 hidden md:block shrink-0 border-r border-zinc-800 pr-6 py-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">Hệ Thống Admin</h2>
              <nav className="flex flex-col gap-1">
                <Link href="/admin" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-zinc-900 transition">
                  📊 Thống kê Tổng quan
                </Link>
                <Link href="/admin/products" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-zinc-900 transition">
                  📦 Quản lý Sản phẩm
                </Link>
                <Link href="/admin/orders" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-zinc-900 transition">
                  💳 Giao dịch & Đơn hàng
                </Link>
                <Link href="/admin/users" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-zinc-900 transition">
                  👥 Quản lý Người dùng
                </Link>
              </nav>
            </div>
            <div className="border-t border-zinc-800 pt-6">
              <Link href="/hub" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-purple-400 rounded-lg hover:bg-zinc-900 transition">
                ⚡ Quay về Hub
              </Link>
            </div>
          </div>
        </aside>

        {/* Content Body */}
        <main className="flex-1 py-6">
          {/* Mobile quick navigation navigation bar */}
          <div className="md:hidden flex gap-2 overflow-x-auto pb-4 mb-4 border-b border-zinc-800">
            <Link href="/admin" className="px-3 py-1.5 text-xs font-semibold whitespace-nowrap bg-zinc-900 rounded-lg hover:bg-zinc-800">
              📊 Thống kê
            </Link>
            <Link href="/admin/products" className="px-3 py-1.5 text-xs font-semibold whitespace-nowrap bg-zinc-900 rounded-lg hover:bg-zinc-800">
              📦 Sản phẩm
            </Link>
            <Link href="/admin/orders" className="px-3 py-1.5 text-xs font-semibold whitespace-nowrap bg-zinc-900 rounded-lg hover:bg-zinc-800">
              💳 Giao dịch
            </Link>
            <Link href="/admin/users" className="px-3 py-1.5 text-xs font-semibold whitespace-nowrap bg-zinc-900 rounded-lg hover:bg-zinc-800">
              👥 Người dùng
            </Link>
          </div>
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
