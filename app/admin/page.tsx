"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Users, CreditCard, DollarSign, ShoppingBag, TrendingUp } from "lucide-react";
import Link from "next/link";

interface Stats {
  totalUsers: number;
  totalRevenue: number;
  orderRevenue: number;
  depositRevenue: number;
  totalOrdersCount: number;
  totalTransactionsCount: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalRevenue: 0,
    orderRevenue: 0,
    depositRevenue: 0,
    totalOrdersCount: 0,
    totalTransactionsCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        
        // 1. Fetch total users count
        const usersSnap = await getDocs(collection(db, "users"));
        const totalUsers = usersSnap.size;

        // 2. Fetch completed orders and calculate revenue
        const ordersQuery = query(collection(db, "orders"), where("status", "==", "COMPLETED"));
        const ordersSnap = await getDocs(ordersQuery);
        let orderRevenue = 0;
        ordersSnap.forEach((doc) => {
          const data = doc.data();
          orderRevenue += Number(data.totalAmount || 0);
        });

        // 3. Fetch successful transactions (deposits) and calculate revenue
        const txQuery = query(collection(db, "transactions"), where("status", "==", "SUCCESS"));
        const txSnap = await getDocs(txQuery);
        let depositRevenue = 0;
        txSnap.forEach((doc) => {
          const data = doc.data();
          depositRevenue += Number(data.amount || 0);
        });

        setStats({
          totalUsers,
          totalRevenue: orderRevenue + depositRevenue,
          orderRevenue,
          depositRevenue,
          totalOrdersCount: ordersSnap.size,
          totalTransactionsCount: txSnap.size
        });
      } catch (error) {
        console.error("Lỗi khi tải thông số thống kê:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Tổng quan Thống kê</h1>
        <p className="text-sm text-zinc-400">Xem và phân tích hoạt động nạp rút & mua bán trên hệ thống B.T AI LABs.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-400 font-mono">TỔNG DOANH THU</span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-500">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white">
              {stats.totalRevenue.toLocaleString()}đ
            </h3>
            <p className="mt-1 text-xs text-zinc-400">Từ ví & đơn hàng trực tiếp</p>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-400 font-mono">NGƯỜI DÙNG</span>
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white">{stats.totalUsers}</h3>
            <p className="mt-1 text-xs text-zinc-400">Tài khoản đã đăng ký</p>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-400 font-mono">ĐƠN MUA</span>
            <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white">
              {stats.orderRevenue.toLocaleString()}đ
            </h3>
            <p className="mt-1 text-xs text-zinc-400">{stats.totalOrdersCount} đơn COMPLETED</p>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-400 font-mono uppercase">Ví nạp</span>
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-500">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white">
              {stats.depositRevenue.toLocaleString()}đ
            </h3>
            <p className="mt-1 text-xs text-zinc-400">{stats.totalTransactionsCount} giao dịch nạp SUCCESS</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-500" /> Bảng điều khiển Quản trị
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/admin/products" className="block p-4 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-purple-500 transition text-sm">
            <div className="font-bold text-white mb-1">Quản lý Sản phẩm</div>
            <p className="text-xs text-zinc-400">Thêm mới, chỉnh sửa thông tin, xóa các gói dịch vụ bán hàng.</p>
          </Link>
          <Link href="/admin/orders" className="block p-4 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-purple-500 transition text-sm">
            <div className="font-bold text-white mb-1">Giao dịch & Đơn hàng</div>
            <p className="text-xs text-zinc-400">Thống kê chi tiết, kiểm soát doanh số và giao dịch nạp tiền.</p>
          </Link>
          <Link href="/admin/users" className="block p-4 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-purple-500 transition text-sm">
            <div className="font-bold text-white mb-1">Quản lý Thành viên</div>
            <p className="text-xs text-zinc-400">Danh sách thành viên, nâng cấp quyền Admin hệ thống.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
