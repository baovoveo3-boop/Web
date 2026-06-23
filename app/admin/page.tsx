"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import {
  Users,
  CreditCard,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  X,
  Calendar,
  FileSpreadsheet
} from "lucide-react";
import Link from "next/link";
import Papa from "papaparse";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";

type FilterOption = "Hôm nay" | "Tuần này" | "Tháng này" | "Năm nay";

interface RawData {
  users: any[];
  orders: any[];
  transactions: any[];
  products: any[];
}

export default function AdminDashboard() {
  const [filter, setFilter] = useState<FilterOption>("Tháng này");
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [rawData, setRawData] = useState<RawData>({
    users: [],
    orders: [],
    transactions: [],
    products: []
  });

  // Advanced CSV Export states
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportReport, setExportReport] = useState<string>("monthly-revenue");
  const [useCustomRange, setUseCustomRange] = useState(false);
  const [quickFilter, setQuickFilter] = useState("Tháng này");

  const [fromDate, setFromDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  });
  const [toDate, setToDate] = useState(() => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  });
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const handleQuickMonthYear = (monthStr: string, yearStr: string) => {
    const y = parseInt(yearStr);
    const m = parseInt(monthStr);
    if (!isNaN(y) && !isNaN(m)) {
      const startStr = `${y}-${String(m).padStart(2, "0")}-01`;
      const lastDay = new Date(y, m, 0).getDate();
      const endStr = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
      setFromDate(startStr);
      setToDate(endStr);
    }
  };

  const cleanPrice = (priceVal: any): number => {
    if (typeof priceVal === "number") return priceVal;
    if (typeof priceVal === "string") {
      const baseValue = priceVal.split("/")[0];
      const cleaned = baseValue.replace(/[^0-9]/g, "");
      const num = parseInt(cleaned, 10);
      return isNaN(num) ? 0 : num;
    }
    return 0;
  };

  const filterListByDate = <T extends { createdAt?: any }>(list: T[], start: Date | null, end: Date | null): T[] => {
    return list.filter((item) => {
      const date = parseFirestoreDate(item.createdAt);
      if (!date) return false;
      if (start && date < start) return false;
      if (end && date > end) return false;
      return true;
    });
  };

  // Report 1: Doanh thu hàng tháng
  const generateMonthlyRevenueReport = (orders: any[], transactions: any[], start: Date | null, end: Date | null) => {
    const monthlyData: Record<string, { month: string; orderRevenue: number; depositRevenue: number }> = {};
    const filteredOrders = filterListByDate(orders, start, end);
    const filteredTransactions = filterListByDate(transactions, start, end);

    filteredOrders.forEach(order => {
      if ((order.status || "").toUpperCase() === "COMPLETED") {
        const date = parseFirestoreDate(order.createdAt);
        if (date) {
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { month: monthKey, orderRevenue: 0, depositRevenue: 0 };
          }
          monthlyData[monthKey].orderRevenue += Number(order.totalAmount || 0);
        }
      }
    });

    filteredTransactions.forEach(tx => {
      if ((tx.status || "").toUpperCase() === "SUCCESS") {
        const date = parseFirestoreDate(tx.createdAt);
        if (date) {
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { month: monthKey, orderRevenue: 0, depositRevenue: 0 };
          }
          monthlyData[monthKey].depositRevenue += Number(tx.amount || 0);
        }
      }
    });

    return Object.values(monthlyData).map(row => ({
      "Tháng": row.month,
      "Doanh thu đơn hàng trực tiếp (VND)": row.orderRevenue,
      "Doanh thu nạp ví (VND)": row.depositRevenue,
      "Tổng cộng (VND)": row.orderRevenue + row.depositRevenue
    })).sort((a, b) => b["Tháng"].localeCompare(a["Tháng"]));
  };

  // Report 2: Doanh thu theo sản phẩm
  const generateProductRevenueReport = (orders: any[], start: Date | null, end: Date | null) => {
    const productData: Record<string, { id: string; name: string; quantity: number; revenue: number }> = {};
    const filteredOrders = filterListByDate(orders, start, end);

    filteredOrders.forEach(order => {
      if ((order.status || "").toUpperCase() === "COMPLETED" && order.items) {
        order.items.forEach((item: any) => {
          const productId = item.id || "unknown";
          const productName = item.name || "Sản phẩm ẩn";
          const price = cleanPrice(item.price);

          if (!productData[productId]) {
            productData[productId] = { id: productId, name: productName, quantity: 0, revenue: 0 };
          }
          productData[productId].quantity += 1;
          productData[productId].revenue += price;
        });
      }
    });

    return Object.values(productData).map(row => ({
      "Mã sản phẩm": row.id,
      "Tên sản phẩm": row.name,
      "Số lượng bán": row.quantity,
      "Doanh thu tích lũy (VND)": row.revenue
    })).sort((a, b) => b["Doanh thu tích lũy (VND)"] - a["Doanh thu tích lũy (VND)"]);
  };

  // Report 3: Top tài khoản chi tiêu mua hàng nhiều nhất
  const generateTopSpendingUsersReport = (orders: any[], users: any[], start: Date | null, end: Date | null) => {
    const userMap: Record<string, { email: string; displayName: string }> = {};
    users.forEach(u => {
      const id = u.uid || u.id;
      if (id) {
        userMap[id] = {
          email: u.email || "—",
          displayName: u.displayName || "Thành viên hệ thống"
        };
      }
    });

    const spendingData: Record<string, { userId: string; amount: number; count: number }> = {};
    const filteredOrders = filterListByDate(orders, start, end);

    filteredOrders.forEach(order => {
      if ((order.status || "").toUpperCase() === "COMPLETED") {
        const uId = order.userId;
        if (uId) {
          if (!spendingData[uId]) {
            spendingData[uId] = { userId: uId, amount: 0, count: 0 };
          }
          spendingData[uId].amount += Number(order.totalAmount || 0);
          spendingData[uId].count += 1;
        }
      }
    });

    return Object.values(spendingData)
      .sort((a, b) => b.amount - a.amount)
      .map((row, index) => {
        const info = userMap[row.userId] || { email: "—", displayName: "Tài khoản không tồn tại" };
        return {
          "Hạng": index + 1,
          "Mã tài khoản (User ID)": row.userId,
          "Email": info.email,
          "Tên hiển thị": info.displayName,
          "Tổng chi tiêu (VND)": row.amount,
          "Số đơn hàng thành công": row.count
        };
      });
  };

  // Report 4: Top tài khoản sử dụng tài nguyên miễn phí nhiều nhất
  const generateTopFreeResourceUsersReport = (orders: any[], users: any[], start: Date | null, end: Date | null) => {
    const userMap: Record<string, { email: string; displayName: string }> = {};
    users.forEach(u => {
      const id = u.uid || u.id;
      if (id) {
        userMap[id] = {
          email: u.email || "—",
          displayName: u.displayName || "Thành viên hệ thống"
        };
      }
    });

    const freeUserMap: Record<string, { uid: string; count: number; itemsList: Set<string> }> = {};
    const filteredOrders = filterListByDate(orders, start, end);

    filteredOrders.forEach(order => {
      if ((order.status || "").toUpperCase() === "COMPLETED") {
        const freeItems = order.items?.filter((item: any) => {
          const price = cleanPrice(item.price);
          const name = (item.name || "").toLowerCase();
          return price === 0 || name.includes("free") || name.includes("miễn phí");
        }) || [];

        const isFreeOrder = Number(order.totalAmount || 0) === 0;
        const hasFreeResource = isFreeOrder || freeItems.length > 0;

        if (hasFreeResource) {
          const uid = order.userId;
          if (uid) {
            if (!freeUserMap[uid]) {
              freeUserMap[uid] = { uid, count: 0, itemsList: new Set() };
            }
            freeUserMap[uid].count += 1;

            if (freeItems.length > 0) {
              freeItems.forEach((it: any) => freeUserMap[uid].itemsList.add(it.name || "Tài nguyên"));
            } else if (isFreeOrder) {
              order.items?.forEach((it: any) => freeUserMap[uid].itemsList.add(it.name || "Gói 0đ"));
            }
          }
        }
      }
    });

    return Object.values(freeUserMap)
      .sort((a, b) => b.count - a.count)
      .map((row, index) => {
        const info = userMap[row.uid] || { email: "—", displayName: "Tài khoản không tồn tại" };
        return {
          "Hạng": index + 1,
          "Mã tài khoản (User ID)": row.uid,
          "Email": info.email,
          "Tên hiển thị": info.displayName,
          "Số lượt tải miễn phí": row.count,
          "Tên các tài nguyên miễn phí đã dùng": Array.from(row.itemsList).join("; ")
        };
      });
  };

  // Report 5: Bảng xếp hạng các Tool/Khóa học được sử dụng nhiều nhất
  const generateToolCourseRankingReport = (orders: any[], products: any[], start: Date | null, end: Date | null) => {
    const productInfoMap: Record<string, { type: string; category: string }> = {};
    products.forEach(p => {
      if (p.id) {
        productInfoMap[p.id] = {
          type: p.type || "",
          category: p.category || ""
        };
      }
    });

    const rankingData: Record<string, { id: string; name: string; usageCount: number; buyers: Set<string> }> = {};
    const filteredOrders = filterListByDate(orders, start, end);

    filteredOrders.forEach(order => {
      if ((order.status || "").toUpperCase() === "COMPLETED" && order.items) {
        order.items.forEach((item: any) => {
          const itemId = item.id || "unknown";
          const itemName = item.name || "Sản phẩm ẩn";

          if (!rankingData[itemId]) {
            rankingData[itemId] = { id: itemId, name: itemName, usageCount: 0, buyers: new Set() };
          }
          rankingData[itemId].usageCount += 1;
          rankingData[itemId].buyers.add(order.userId);
        });
      }
    });

    return Object.values(rankingData)
      .sort((a, b) => b.usageCount - a.usageCount)
      .map((row, index) => {
        const info = productInfoMap[row.id];
        let categoryStr = "";
        if (info) {
          const parts = [];
          if (info.type) parts.push(info.type);
          if (info.category) parts.push(info.category);
          categoryStr = parts.join(" / ");
        }

        if (!categoryStr) {
          const lowerName = row.name.toLowerCase();
          if (lowerName.includes("tool") || lowerName.includes("bypass") || lowerName.includes("automation") || lowerName.includes("software")) {
            categoryStr = "Phần mềm/Tool";
          } else if (lowerName.includes("khóa học") || lowerName.includes("course") || lowerName.includes("master") || lowerName.includes("academy")) {
            categoryStr = "Khóa học";
          } else if (lowerName.includes("combo")) {
            categoryStr = "Gói Combo";
          } else {
            categoryStr = "Khác";
          }
        }

        return {
          "Hạng": index + 1,
          "Mã sản phẩm": row.id,
          "Tên sản phẩm": row.name,
          "Phân loại": categoryStr,
          "Tổng lượt sử dụng (Đơn hàng)": row.usageCount,
          "Số tài khoản duy nhất đã sở hữu": row.buyers.size
        };
      });
  };

  const getExportDateRange = (): { start: Date | null; end: Date | null } => {
    if (!useCustomRange) {
      const now = new Date();
      const start = new Date();
      start.setHours(0, 0, 0, 0);

      switch (quickFilter) {
        case "Hôm nay":
          return { start, end: now };
        case "Tuần này": {
          const day = start.getDay();
          const diff = day === 0 ? 6 : day - 1;
          start.setDate(start.getDate() - diff);
          return { start, end: now };
        }
        case "Tháng này":
          start.setDate(1);
          return { start, end: now };
        case "Năm nay":
          start.setMonth(0, 1);
          return { start, end: now };
        case "Tất cả thời gian":
        default:
          return { start: null, end: null };
      }
    } else {
      const start = fromDate ? new Date(fromDate + "T00:00:00") : null;
      const end = toDate ? new Date(toDate + "T23:59:59.999") : null;
      return { start, end };
    }
  };

  const handleExportCSV = () => {
    const { start, end } = getExportDateRange();

    let dataToExport: any[] = [];
    let fileLabel = "";

    switch (exportReport) {
      case "monthly-revenue":
        dataToExport = generateMonthlyRevenueReport(rawData.orders, rawData.transactions, start, end);
        fileLabel = "Bao_cao_doanh_thu_hang_thang";
        break;
      case "product-revenue":
        dataToExport = generateProductRevenueReport(rawData.orders, start, end);
        fileLabel = "Bao_cao_doanh_thu_theo_san_pham";
        break;
      case "top-spending":
        dataToExport = generateTopSpendingUsersReport(rawData.orders, rawData.users, start, end);
        fileLabel = "Top_khach_hang_chi_tieu_nhieu_nhat";
        break;
      case "top-free":
        dataToExport = generateTopFreeResourceUsersReport(rawData.orders, rawData.users, start, end);
        fileLabel = "Top_tai_khoan_tai_nguyen_mien_phi";
        break;
      case "tool-course-ranking":
        dataToExport = generateToolCourseRankingReport(rawData.orders, rawData.products, start, end);
        fileLabel = "Bang_xep_hang_tool_khoa_hoc";
        break;
      default:
        alert("Loại báo cáo không hợp lệ!");
        return;
    }

    if (!dataToExport || dataToExport.length === 0) {
      alert("Không có dữ liệu phù hợp trong khoảng thời gian đã chọn!");
      return;
    }

    const csvString = Papa.unparse(dataToExport);
    const bom = "\uFEFF";
    const blobContent = bom + csvString;
    const blob = new Blob([blobContent], { type: "text/csv;charset=utf-8;" });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    let suffix = "";
    if (!useCustomRange) {
      suffix = `_${quickFilter.toLowerCase().replace(/ /g, "_")}`;
    } else {
      suffix = `_tu_${fromDate || "dau"}_den_${toDate || "cuoi"}`;
    }

    link.setAttribute("download", `${fileLabel}${suffix}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsExportModalOpen(false);
  };

  useEffect(() => {
    setMounted(true);
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch users
        const usersSnap = await getDocs(collection(db, "users"));
        const allUsers: any[] = [];
        usersSnap.forEach((doc) => {
          allUsers.push({ id: doc.id, ...doc.data() });
        });

        // Fetch orders
        const ordersSnap = await getDocs(collection(db, "orders"));
        const allOrders: any[] = [];
        ordersSnap.forEach((doc) => {
          allOrders.push({ id: doc.id, ...doc.data() });
        });

        // Fetch transactions (deposits)
        const txSnap = await getDocs(collection(db, "transactions"));
        const allTransactions: any[] = [];
        txSnap.forEach((doc) => {
          allTransactions.push({ id: doc.id, ...doc.data() });
        });

        // Fetch products
        const productsSnap = await getDocs(collection(db, "products"));
        const allProducts: any[] = [];
        productsSnap.forEach((doc) => {
          allProducts.push({ id: doc.id, ...doc.data() });
        });

        setRawData({
          users: allUsers,
          orders: allOrders,
          transactions: allTransactions,
          products: allProducts
        });
      } catch (error) {
        console.error("Lỗi khi tải thông số thống kê:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Date parsing logic to safely convert Firestore timestamps or ISO strings into standard Date objects
  const parseFirestoreDate = (timestamp: any): Date | null => {
    if (!timestamp) return null;
    if (timestamp instanceof Date) return timestamp;
    if (typeof timestamp === "object") {
      if (typeof timestamp.seconds === "number") {
        return new Date(timestamp.seconds * 1000 + (timestamp.nanoseconds ? Math.floor(timestamp.nanoseconds / 1000000) : 0));
      }
      if (typeof timestamp.toDate === "function") {
        return timestamp.toDate();
      }
    }
    if (typeof timestamp === "string" || typeof timestamp === "number") {
      const parsed = new Date(timestamp);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    return null;
  };

  const getFilterRange = (opt: FilterOption) => {
    const now = new Date();
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    if (opt === "Hôm nay") {
      // 00:00:00 of the current day (local time)
    } else if (opt === "Tuần này") {
      // Monday 00:00:00 of the current week (local time)
      const day = start.getDay();
      const diff = day === 0 ? 6 : day - 1;
      start.setDate(start.getDate() - diff);
    } else if (opt === "Tháng này") {
      // 1st of the current month 00:00:00 (local time)
      start.setDate(1);
    } else if (opt === "Năm nay") {
      // Jan 1st 00:00:00 (local time)
      start.setMonth(0, 1);
    }

    return { start, end: now };
  };

  const { start: filterStart, end: filterEnd } = getFilterRange(filter);

  // Filter lists in memory
  const filterItems = <T extends { createdAt?: any }>(list: T[]): T[] => {
    return list.filter((item) => {
      const date = parseFirestoreDate(item.createdAt);
      if (!date) return false;
      return date >= filterStart && date <= filterEnd;
    });
  };

  const filteredUsers = filterItems(rawData.users);
  const filteredOrders = filterItems(rawData.orders);
  const filteredTransactions = filterItems(rawData.transactions);

  // 4 main overview cards logic
  let orderRevenue = 0;
  let totalOrdersCount = 0;
  filteredOrders.forEach((order) => {
    if ((order.status || "").toUpperCase() === "COMPLETED") {
      orderRevenue += Number(order.totalAmount || 0);
      totalOrdersCount += 1;
    }
  });

  let depositRevenue = 0;
  let totalTransactionsCount = 0;
  filteredTransactions.forEach((tx) => {
    if ((tx.status || "").toUpperCase() === "SUCCESS") {
      depositRevenue += Number(tx.amount || 0);
      totalTransactionsCount += 1;
    }
  });

  const stats = {
    totalUsers: filteredUsers.length,
    totalRevenue: orderRevenue + depositRevenue,
    orderRevenue,
    depositRevenue,
    totalOrdersCount,
    totalTransactionsCount
  };

  // Generate Recharts time buckets
  const initTimeBuckets = (opt: FilterOption) => {
    const buckets: { [key: string]: { label: string; revenue: number; users: number } } = {};
    const orderList: string[] = [];

    if (opt === "Hôm nay") {
      for (let h = 0; h < 24; h++) {
        const label = `${String(h).padStart(2, "0")}:00`;
        buckets[label] = { label, revenue: 0, users: 0 };
        orderList.push(label);
      }
    } else if (opt === "Tuần này") {
      const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"];
      days.forEach((day) => {
        buckets[day] = { label: day, revenue: 0, users: 0 };
        orderList.push(day);
      });
    } else if (opt === "Tháng này") {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        const label = `${String(d).padStart(2, "0")}/${String(month + 1).padStart(2, "0")}`;
        buckets[label] = { label, revenue: 0, users: 0 };
        orderList.push(label);
      }
    } else if (opt === "Năm nay") {
      for (let m = 1; m <= 12; m++) {
        const label = `Tháng ${m}`;
        buckets[label] = { label, revenue: 0, users: 0 };
        orderList.push(label);
      }
    }

    return { buckets, orderList };
  };

  const getBucketKey = (date: Date, opt: FilterOption) => {
    if (opt === "Hôm nay") {
      return `${String(date.getHours()).padStart(2, "0")}:00`;
    } else if (opt === "Tuần này") {
      const day = date.getDay();
      const days = ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
      return days[day];
    } else if (opt === "Tháng này") {
      const d = date.getDate();
      const m = date.getMonth() + 1;
      return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}`;
    } else if (opt === "Năm nay") {
      return `Tháng ${date.getMonth() + 1}`;
    }
    return "";
  };

  const { buckets, orderList } = initTimeBuckets(filter);

  // Populate time buckets for charts
  filteredOrders.forEach((order) => {
    if ((order.status || "").toUpperCase() === "COMPLETED") {
      const date = parseFirestoreDate(order.createdAt);
      if (date) {
        const key = getBucketKey(date, filter);
        if (buckets[key]) {
          buckets[key].revenue += Number(order.totalAmount || 0);
        }
      }
    }
  });

  filteredTransactions.forEach((tx) => {
    if ((tx.status || "").toUpperCase() === "SUCCESS") {
      const date = parseFirestoreDate(tx.createdAt);
      if (date) {
        const key = getBucketKey(date, filter);
        if (buckets[key]) {
          buckets[key].revenue += Number(tx.amount || 0);
        }
      }
    }
  });

  filteredUsers.forEach((user) => {
    const date = parseFirestoreDate(user.createdAt);
    if (date) {
      const key = getBucketKey(date, filter);
      if (buckets[key]) {
        buckets[key].users += 1;
      }
    }
  });

  const chartData = orderList.map((key) => buckets[key]);

  // Product Best-Sellers Ranking (Course/Tool)
  const productSales: { [key: string]: { name: string; quantity: number; revenue: number } } = {};
  filteredOrders.forEach((order) => {
    if ((order.status || "").toUpperCase() === "COMPLETED" && order.items) {
      order.items.forEach((item: any) => {
        const name = item.name || item.id || "Sản phẩm ẩn";
        if (!productSales[name]) {
          productSales[name] = { name, quantity: 0, revenue: 0 };
        }
        productSales[name].quantity += 1;
        productSales[name].revenue += Number(item.price || 0);
      });
    }
  });

  const bestSellingProducts = Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Success vs Failure Rates
  let successCount = 0;
  let pendingCount = 0;
  let failedCount = 0;

  filteredTransactions.forEach((tx) => {
    const status = (tx.status || "").toUpperCase();
    if (status === "SUCCESS") successCount++;
    else if (status === "PENDING") pendingCount++;
    else failedCount++;
  });

  filteredOrders.forEach((order) => {
    const status = (order.status || "").toUpperCase();
    if (status === "COMPLETED") successCount++;
    else if (status === "PENDING") pendingCount++;
    else failedCount++;
  });

  const totalTxCount = successCount + pendingCount + failedCount;
  const pieData = [
    { name: "Thành công", value: successCount, color: "#22c55e" },
    { name: "Đang chờ", value: pendingCount, color: "#f59e0b" },
    { name: "Thất bại", value: failedCount, color: "#ef4444" }
  ].filter((item) => item.value > 0);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const filterOptions: FilterOption[] = ["Hôm nay", "Tuần này", "Tháng này", "Năm nay"];

  return (
    <div className="space-y-6">
      {/* Top Header & Filter Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-purple-500" /> Tổng quan Thống kê
          </h1>
          <p className="text-sm text-zinc-400">Xem và phân tích hoạt động nạp rút & mua bán trên hệ thống B.T AI LABs.</p>
        </div>

        {/* Time Filter Controls & CSV Export */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-1 rounded-lg w-fit">
            {filterOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${
                  filter === opt
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition shadow-md shadow-purple-600/20"
          >
            <Download className="h-3.5 w-3.5" /> Xuất CSV Nâng cao
          </button>
        </div>
      </div>

      {/* 4 Main Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Revenue */}
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

        {/* Card 2: Users */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-400 font-mono">NGƯỜI DÙNG</span>
            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white">{stats.totalUsers}</h3>
            <p className="mt-1 text-xs text-zinc-400 font-medium">Tài khoản đã đăng ký</p>
          </div>
        </div>

        {/* Card 3: Orders */}
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

        {/* Card 4: Deposits */}
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Report 1: Revenue Over Time */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-500" /> Biểu đồ Doanh thu ({filter})
            </h3>
            <p className="text-xs text-zinc-400">Doanh thu bán đơn hàng và nạp ví tích lũy</p>
          </div>
          <div className="h-[300px] w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="label" stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#a1a1aa"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px" }}
                    labelClassName="text-white font-bold text-xs"
                    formatter={(value: any) => [`${Number(value).toLocaleString()}đ`, "Doanh thu"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#22c55e" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-500 text-xs">Đang tải biểu đồ...</div>
            )}
          </div>
        </div>

        {/* Report 2: New User Growth */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" /> Tăng trưởng Thành viên ({filter})
            </h3>
            <p className="text-xs text-zinc-400">Số lượng tài khoản đăng ký mới</p>
          </div>
          <div className="h-[300px] w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="label" stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px" }}
                    labelClassName="text-white font-bold text-xs"
                    formatter={(value: any) => [`${value} tài khoản`, "Đăng ký mới"]}
                  />
                  <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-500 text-xs">Đang tải biểu đồ...</div>
            )}
          </div>
        </div>

        {/* Report 3: Best-selling Products Ranking */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="h-4 w-4 text-purple-500" /> Xếp hạng Gói Bán chạy ({filter})
            </h3>
            <p className="text-xs text-zinc-400">Top 5 sản phẩm/khóa học/tool theo số lượng bán</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[300px] items-center">
            {/* Bar Chart */}
            <div className="h-full w-full">
              {mounted ? (
                bestSellingProducts.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bestSellingProducts} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                      <XAxis type="number" stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} width={80} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px" }}
                        formatter={(value: any) => [`${value} lượt`, "Số lượng bán"]}
                      />
                      <Bar dataKey="quantity" fill="#a855f7" radius={[0, 4, 4, 0]} barSize={12}>
                        {bestSellingProducts.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? "#a855f7" : index === 1 ? "#3b82f6" : "#22c55e"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-zinc-500 text-xs italic">Không có dữ liệu đơn hàng thành công.</div>
                )
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-500 text-xs">Đang tải biểu đồ...</div>
              )}
            </div>

            {/* Custom Styled List */}
            <div className="space-y-3 overflow-y-auto max-h-full pr-1">
              {bestSellingProducts.length > 0 ? (
                bestSellingProducts.map((prod, index) => (
                  <div key={prod.name} className="flex items-center gap-3 p-2.5 rounded-lg bg-zinc-900 border border-zinc-800/80">
                    <div className={`h-6 w-6 flex items-center justify-center rounded-full text-xs font-bold ${
                      index === 0 ? "bg-purple-600 text-white" : index === 1 ? "bg-blue-600 text-white" : index === 2 ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400"
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white truncate">{prod.name}</div>
                      <div className="text-[10px] text-zinc-400">{prod.revenue.toLocaleString()}đ</div>
                    </div>
                    <div className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                      {prod.quantity} lượt
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-500 italic text-center py-8">Chưa có giao dịch trong thời gian lọc.</p>
              )}
            </div>
          </div>
        </div>

        {/* Report 4: Transaction Success vs Failure Rates */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Tỷ lệ Giao dịch thành công ({filter})
            </h3>
            <p className="text-xs text-zinc-400">Tỷ lệ thành công, đang xử lý và thất bại của đơn hàng & nạp tiền</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[300px] items-center">
            {/* Pie Chart */}
            <div className="h-full w-full">
              {mounted ? (
                pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px" }}
                        formatter={(value: any) => [`${value} giao dịch`, "Số lượng"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-zinc-500 text-xs italic">Không có dữ liệu giao dịch.</div>
                )
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-500 text-xs">Đang tải biểu đồ...</div>
              )}
            </div>

            {/* Success rates progress bars */}
            <div className="space-y-4">
              {totalTxCount > 0 ? (
                [
                  { name: "Thành công", count: successCount, color: "bg-emerald-500", text: "text-emerald-500", icon: CheckCircle2 },
                  { name: "Đang chờ", count: pendingCount, color: "bg-amber-500", text: "text-amber-500", icon: Clock },
                  { name: "Thất bại", count: failedCount, color: "bg-red-500", text: "text-red-500", icon: AlertCircle }
                ].map((item) => {
                  const percent = totalTxCount > 0 ? (item.count / totalTxCount) * 100 : 0;
                  const Icon = item.icon;
                  return (
                    <div key={item.name} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="flex items-center gap-1.5 font-bold text-white">
                          <Icon className={`h-4 w-4 ${item.text}`} /> {item.name}
                        </span>
                        <span className="font-mono text-zinc-400">
                          {item.count} ({percent.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-zinc-500 italic text-center py-8">Chưa có giao dịch trong thời gian lọc.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Operations Submenu section */}
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

      {/* CSV Export Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-805 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-purple-500" />
                Xuất Báo cáo CSV Nâng cao
              </h3>
              <button onClick={() => setIsExportModalOpen(false)} className="text-zinc-400 hover:text-white transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Body */}
            <div className="mt-4 space-y-4">
              {/* Report Type Selector */}
              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">LOẠI BÁO CÁO</label>
                <select
                  value={exportReport}
                  onChange={(e) => setExportReport(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 text-sm p-2 rounded-lg focus:outline-none focus:border-purple-600 font-medium"
                >
                  <option value="monthly-revenue">Báo cáo doanh thu hàng tháng</option>
                  <option value="product-revenue">Báo cáo doanh thu theo sản phẩm</option>
                  <option value="top-spending">Top tài khoản chi tiêu nhiều nhất</option>
                  <option value="top-free">Top tài khoản nhận tài nguyên miễn phí</option>
                  <option value="tool-course-ranking">Bảng xếp hạng Tool/Khóa học</option>
                </select>
              </div>

              {/* Time Filter Selection */}
              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-2">THỜI GIAN LỌC</label>
                <div className="flex gap-2 p-1 bg-zinc-950 border border-zinc-800 rounded-lg text-xs mb-3">
                  <button
                    type="button"
                    onClick={() => setUseCustomRange(false)}
                    className={`flex-1 py-1.5 rounded-md font-bold transition ${!useCustomRange ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                  >
                    Mốc cố định
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseCustomRange(true)}
                    className={`flex-1 py-1.5 rounded-md font-bold transition ${useCustomRange ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                  >
                    Tùy chọn khoảng ngày
                  </button>
                </div>

                {/* Standard Filters */}
                {!useCustomRange ? (
                  <select
                    value={quickFilter}
                    onChange={(e) => setQuickFilter(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 text-sm p-2 rounded-lg focus:outline-none focus:border-purple-600 font-medium"
                  >
                    <option value="Tất cả thời gian">Tất cả thời gian</option>
                    <option value="Hôm nay">Hôm nay</option>
                    <option value="Tuần này">Tuần này</option>
                    <option value="Tháng này">Tháng này</option>
                    <option value="Năm nay">Năm nay</option>
                  </select>
                ) : (
                  /* Custom Range Fields */
                  <div className="space-y-3">
                    {/* Day/Month/Year Selectors */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-zinc-500 font-bold block mb-0.5">Tháng nhanh</label>
                        <select
                          value={selectedMonth}
                          onChange={(e) => {
                            setSelectedMonth(e.target.value);
                            handleQuickMonthYear(e.target.value, selectedYear);
                          }}
                          className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs p-1.5 rounded"
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                            <option key={m} value={m}>Tháng {m}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-500 font-bold block mb-0.5">Năm nhanh</label>
                        <select
                          value={selectedYear}
                          onChange={(e) => {
                            setSelectedYear(e.target.value);
                            handleQuickMonthYear(selectedMonth, e.target.value);
                          }}
                          className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs p-1.5 rounded"
                        >
                          {["2024", "2025", "2026", "2027"].map(y => (
                            <option key={y} value={y}>Năm {y}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Calendar Date Inputs */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-zinc-500 font-bold block mb-0.5">Từ ngày</label>
                        <input
                          type="date"
                          value={fromDate}
                          onChange={(e) => setFromDate(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs p-1.5 rounded focus:outline-none focus:border-purple-600 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-500 font-bold block mb-0.5">Đến ngày</label>
                        <input
                          type="date"
                          value={toDate}
                          onChange={(e) => setToDate(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs p-1.5 rounded focus:outline-none focus:border-purple-600 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white py-2 text-sm rounded-lg font-bold transition"
              >
                Hủy
              </button>
              <button
                onClick={handleExportCSV}
                className="flex-1 bg-purple-600 hover:bg-purple-500 text-white py-2 text-sm rounded-lg font-bold transition flex items-center justify-center gap-1.5"
              >
                <Download className="h-4 w-4" /> Xuất file CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
