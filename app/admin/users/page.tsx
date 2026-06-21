"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { Users, Shield, ArrowUpCircle, Check } from "lucide-react";

interface UserRecord {
  uid: string;
  email: string | null;
  displayName: string | null;
  walletBalance: number;
  currentTier: string;
  role: "user" | "admin";
  createdAt?: any;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, "users"));
      const list: UserRecord[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          uid: docSnap.id,
          email: data.email || "",
          displayName: data.displayName || "",
          walletBalance: Number(data.walletBalance || 0),
          currentTier: data.currentTier || "free",
          role: data.role || "user",
          createdAt: data.createdAt
        });
      });
      // Sort in memory: Admins first, then users alphabetically by display name
      list.sort((a, b) => {
        if (a.role === "admin" && b.role !== "admin") return -1;
        if (a.role !== "admin" && b.role === "admin") return 1;
        return (a.displayName || "").localeCompare(b.displayName || "");
      });
      setUsers(list);
    } catch (error) {
      console.error("Lỗi khi tải danh sách người dùng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const promoteToAdmin = async (uid: string) => {
    if (!confirm("Bạn có chắc chắn muốn cấp quyền quản trị viên Admin cho tài khoản này?")) {
      return;
    }

    try {
      setUpdatingId(uid);
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        role: "admin"
      });
      fetchUsers();
    } catch (error) {
      console.error("Lỗi khi thay đổi phân quyền:", error);
      alert("Lỗi khi thực hiện phân quyền.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="h-6 w-6 text-neonPurple" /> Quản lý Người dùng
        </h1>
        <p className="text-sm text-zinc-400">Danh sách thành viên đăng ký trên hệ thống và các thao tác phân quyền quản trị.</p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-neonPurple"></div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/30">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50 text-xs font-bold uppercase tracking-wider text-zinc-400">
                <th className="p-4">Thành viên</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phân quyền</th>
                <th className="p-4">Số dư ví</th>
                <th className="p-4">Gói tài khoản</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-sm">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500">
                    Chưa có tài khoản nào được tạo lập.
                  </td>
                </tr>
              ) : (
                users.map((userRecord) => (
                  <tr key={userRecord.uid} className="hover:bg-zinc-900/20">
                    <td className="p-4 font-bold text-white">
                      {userRecord.displayName || "Thành viên"}
                    </td>
                    <td className="p-4 text-zinc-300 font-mono text-xs">
                      {userRecord.email || "—"}
                    </td>
                    <td className="p-4">
                      {userRecord.role === "admin" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neonPurple/10 text-neonPurple border border-neonPurple/20">
                          <Shield className="h-3 w-3" /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-400">
                          Thành viên
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-bold text-neonGreen font-mono">
                      {userRecord.walletBalance.toLocaleString()}đ
                    </td>
                    <td className="p-4 capitalize font-mono text-zinc-300">
                      {userRecord.currentTier}
                    </td>
                    <td className="p-4 text-center">
                      {userRecord.role === "admin" ? (
                        <span className="inline-flex items-center gap-1 text-xs text-neonPurple font-medium bg-neonPurple/5 px-2 py-1 rounded">
                          <Check className="h-3.5 w-3.5" /> Đã là Admin
                        </span>
                      ) : (
                        <button
                          onClick={() => promoteToAdmin(userRecord.uid)}
                          disabled={updatingId === userRecord.uid}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-zinc-900 border border-zinc-800 rounded-lg hover:border-neonPurple hover:bg-zinc-800 transition disabled:opacity-50"
                        >
                          {updatingId === userRecord.uid ? (
                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-t-transparent border-white"></span>
                          ) : (
                            <ArrowUpCircle className="h-3.5 w-3.5 text-neonPurple" />
                          )}
                          Cấp quyền Admin
                        </button>
                      )}
                    </td>
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
