"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { CreditCard, ShoppingBag, ArrowUpRight, CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface Order {
  id: string;
  userId: string;
  items: Array<{ id: string; name: string; price: number | string }>;
  totalAmount: number;
  status: string;
  createdAt: any;
}

interface Transaction {
  id: string;
  orderCode: number;
  userId: string;
  userEmail: string;
  amount: number;
  description: string;
  status: string;
  createdAt: any;
}

export default function AdminOrdersAndTransactions() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "transactions">("orders");

  const getTimestampMillis = (timestamp: any) => {
    if (!timestamp) return 0;
    if (timestamp && typeof timestamp === "object" && "seconds" in timestamp) {
      return timestamp.seconds * 1000;
    }
    if (timestamp && typeof timestamp.toDate === "function") {
      return timestamp.toDate().getTime();
    }
    const d = new Date(timestamp);
    return isNaN(d.getTime()) ? 0 : d.getTime();
  };

  const formatDateTime = (timestamp: any) => {
    if (!timestamp) return "—";
    
    // If it's a Firestore Timestamp
    if (timestamp && typeof timestamp === "object" && "seconds" in timestamp) {
      return new Date(timestamp.seconds * 1000).toLocaleString("vi-VN");
    }
    
    // If it's a Timestamp with toDate method (Firestore Timestamp object)
    if (timestamp && typeof timestamp.toDate === "function") {
      return timestamp.toDate().toLocaleString("vi-VN");
    }
    
    // If it's a string/number
    try {
      const d = new Date(timestamp);
      if (!isNaN(d.getTime())) {
        return d.toLocaleString("vi-VN");
      }
    } catch (e) {}
    
    return "—";
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Fetch orders from Firestore
      const ordersSnap = await getDocs(collection(db, "orders"));
      const ordersList: Order[] = [];
      ordersSnap.forEach((doc) => {
        const data = doc.data();
        ordersList.push({
          id: doc.id,
          userId: data.userId || "",
          items: data.items || [],
          totalAmount: Number(data.totalAmount || 0),
          status: data.status || "COMPLETED",
          createdAt: data.createdAt || ""
        });
      });
      // Sort in memory to avoid index requirements
      ordersList.sort((a, b) => getTimestampMillis(b.createdAt) - getTimestampMillis(a.createdAt));
      setOrders(ordersList);

      // 2. Fetch transactions from Firestore
      const txsSnap = await getDocs(collection(db, "transactions"));
      const txsList: Transaction[] = [];
      txsSnap.forEach((doc) => {
        const data = doc.data();
        txsList.push({
          id: doc.id,
          orderCode: Number(data.orderCode || 0),
          userId: data.userId || "",
          userEmail: data.userEmail || "",
          amount: Number(data.amount || 0),
          description: data.description || "",
          status: data.status || "PENDING",
          createdAt: data.createdAt || ""
        });
      });
      txsList.sort((a, b) => getTimestampMillis(b.createdAt) - getTimestampMillis(a.createdAt));
      setTransactions(txsList);
    } catch (error) {
      console.error("Lỗi khi tải danh sách giao dịch:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "SUCCESS":
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="h-3 w-3" /> Thành công
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500">
            <Clock className="h-3 w-3" /> Đang chờ
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-500">
            <AlertCircle className="h-3 w-3" /> Thất bại
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-neonPurple" /> Lịch sử Giao dịch
          </h1>
          <p className="text-sm text-zinc-400">Xem và lọc tất cả các đơn mua hàng và nạp tiền thành công.</p>
        </div>
      </div>

      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === "orders"
              ? "border-neonPurple text-neonPurple"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <ShoppingBag className="h-4 w-4" /> Đơn hàng ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab("transactions")}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === "transactions"
              ? "border-neonPurple text-neonPurple"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <ArrowUpRight className="h-4 w-4" /> Giao dịch nạp tiền ({transactions.length})
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-neonPurple"></div>
        </div>
      ) : activeTab === "orders" ? (
        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/30">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50 text-xs font-bold uppercase tracking-wider text-zinc-400">
                <th className="p-4">Thời gian</th>
                <th className="p-4">Mã đơn</th>
                <th className="p-4">User ID</th>
                <th className="p-4">Sản phẩm</th>
                <th className="p-4">Tổng tiền</th>
                <th className="p-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-sm">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500">
                    Chưa có đơn hàng nào được thực hiện.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-900/20">
                    <td className="p-4 text-zinc-400 font-mono">
                      {formatDateTime(order.createdAt)}
                    </td>
                    <td className="p-4 font-mono text-zinc-300 text-xs" title={order.id}>
                      {order.id.slice(0, 8)}...
                    </td>
                    <td className="p-4 font-mono text-zinc-400 text-xs" title={order.userId}>
                      {order.userId.slice(0, 8)}...
                    </td>
                    <td className="p-4">
                      <div className="max-w-xs space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-zinc-200">
                            • {item.name} <span className="text-zinc-500 font-mono text-xs">({typeof item.price === 'number' ? `${item.price.toLocaleString()}đ` : item.price})</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-neonGreen font-mono">
                      {order.totalAmount.toLocaleString()}đ
                    </td>
                    <td className="p-4">{getStatusBadge(order.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/30">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50 text-xs font-bold uppercase tracking-wider text-zinc-400">
                <th className="p-4">Thời gian</th>
                <th className="p-4">Mã giao dịch</th>
                <th className="p-4">Email khách hàng</th>
                <th className="p-4">Nội dung</th>
                <th className="p-4">Số tiền</th>
                <th className="p-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-sm">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500">
                    Chưa có giao dịch nạp tiền nào được thực hiện.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-zinc-900/20">
                    <td className="p-4 text-zinc-400 font-mono">
                      {formatDateTime(tx.createdAt)}
                    </td>
                    <td className="p-4 font-mono text-zinc-300">
                      {tx.orderCode}
                    </td>
                    <td className="p-4 text-zinc-300 max-w-[150px] truncate" title={tx.userEmail}>
                      {tx.userEmail || "—"}
                    </td>
                    <td className="p-4 text-zinc-400">{tx.description}</td>
                    <td className="p-4 font-bold text-neonGreen font-mono">
                      +{tx.amount.toLocaleString()}đ
                    </td>
                    <td className="p-4">{getStatusBadge(tx.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
