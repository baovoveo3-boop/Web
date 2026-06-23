"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { ScrollText, Clock, User, ShieldAlert } from "lucide-react";

interface AdminLogRecord {
  id: string;
  adminUid: string;
  adminEmail: string;
  action: string;
  target: string;
  details: string;
  timestamp: any;
}

export default function AdminLogs() {
  const { userData } = useAuth();
  const [logs, setLogs] = useState<AdminLogRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      if (userData?.role !== "super_admin") {
        setLoading(false);
        return;
      }
      try {
        const q = query(collection(db, "admin_logs"), orderBy("timestamp", "desc"));
        const snap = await getDocs(q);
        const list: AdminLogRecord[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            adminUid: data.adminUid || "",
            adminEmail: data.adminEmail || "",
            action: data.action || "",
            target: data.target || "",
            details: data.details || "",
            timestamp: data.timestamp
          });
        });
        setLogs(list);
      } catch (error) {
        console.error("Lỗi khi tải lịch sử thao tác:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [userData]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-neonPurple"></div>
      </div>
    );
  }

  if (userData?.role !== "super_admin") {
    return (
      <div className="flex flex-col h-64 items-center justify-center space-y-4">
        <ShieldAlert className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-bold text-white">Quyền Truy Cập Bị Từ Chối</h2>
        <p className="text-zinc-400">Chỉ có Super Admin mới có quyền xem Lịch sử thao tác hệ thống.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ScrollText className="h-6 w-6 text-neonPurple" /> Nhật ký Quản trị
        </h1>
        <p className="text-sm text-zinc-400">Giám sát mọi thay đổi, thêm, sửa, xóa dữ liệu trên hệ thống.</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/30">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50 text-xs font-bold uppercase tracking-wider text-zinc-400">
              <th className="p-4">Thời gian</th>
              <th className="p-4">Người thực hiện</th>
              <th className="p-4">Hành động</th>
              <th className="p-4">Mục tiêu</th>
              <th className="p-4">Chi tiết thay đổi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 text-sm">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-zinc-500">
                  Chưa có lịch sử thao tác nào.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-900/20">
                  <td className="p-4 text-zinc-400 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {log.timestamp ? new Date(log.timestamp.toDate()).toLocaleString("vi-VN") : "Đang xử lý..."}
                    </div>
                  </td>
                  <td className="p-4 text-neonGreen font-mono font-bold">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {log.adminEmail}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-zinc-800 text-white">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-zinc-300">
                    {log.target}
                  </td>
                  <td className="p-4 text-zinc-400">
                    {log.details}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
