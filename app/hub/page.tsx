"use client";

import { Suspense, useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Shield, Activity, Cpu, LogOut, BarChart3, Settings, 
  LayoutDashboard, User, Lock, Mail, Play, Hammer, CheckSquare, Square,
  Menu, X, Key, GitMerge, BookOpen, Wallet, History, UserCog, CreditCard, ChevronRight, ShoppingCart,
  Building2, Copy, AlertTriangle, Headset, ExternalLink, QrCode,
  Download, Search, ChevronDown, Calendar, ArrowDownRight, ArrowUpRight, Clock, Inbox, ChevronLeft, Camera, Edit2
} from 'lucide-react';
import CircuitAnimation from '@/components/CircuitAnimation';
import { useAuth } from '@/context/AuthContext';

function HubContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');
  const billing = searchParams.get('billing');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Format account tier display text
  let tierText = 'Free';
  let isVip = false;
  let isUltimate = false;
  
  if (plan === 'vip') {
    tierText = billing === 'yearly' ? 'VIP (Yearly)' : 'VIP (Monthly)';
    isVip = true;
  } else if (plan === 'ultimate') {
    tierText = billing === 'yearly' ? 'Ultimate (Yearly)' : 'Ultimate (Monthly)';
    isUltimate = true;
  }

  // Active status state
  const isActivated = isVip || isUltimate;

  // Checkbox states (green ticks when active)
  const [deepScan, setDeepScan] = useState(true);
  const [autoClean, setAutoClean] = useState(false);
  const [notifySupport, setNotifySupport] = useState(true);

  // Terminal log
  const [logs, setLogs] = useState<string[]>([
    "[SYSTEM] Khởi động B.T AI Labs Hub...",
    "[SYSTEM] Đang nạp cấu hình hệ thống...",
  ]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Dashboard Tab State
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const { user, userData } = useAuth();
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);

  const handlePayment = async () => {
    if (!amount || amount < 2000) {
      alert("Số tiền nạp tối thiểu là 2.000đ");
      return;
    }
    if (!user) {
      alert("Vui lòng đăng nhập lại");
      return;
    }

    setIsLoadingPayment(true);
    try {
      const res = await fetch('/api/payment/create-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(amount),
          description: "Nạp tiền vào ví",
          userId: user.uid,
          userEmail: user.email
        })
      });

      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert("Lỗi tạo mã thanh toán: " + (data.error || 'Unknown Error'));
      }
    } catch (error) {
      console.error(error);
      alert("Không thể kết nối đến máy chủ thanh toán.");
    } finally {
      setIsLoadingPayment(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = '/login';
        return;
      }
      
      const search = new URLSearchParams(window.location.search);
      const tab = search.get('tab');
      if (tab) {
        setActiveTab(tab);
      }
    }
  }, []);

  // Payment State
  const [amount, setAmount] = useState<number | ''>('');

  useEffect(() => {
    if (!isActivated) {
      setLogs(prev => [...prev, "[WARNING] Chế độ Khách: Một số tính năng bị khóa. Hãy mua gói VIP/Ultimate để mở khóa."]);
      return;
    }
    setLogs(prev => [...prev, `[SUCCESS] Đã kết nối gói dịch vụ: ${tierText}`]);
    const timer = setInterval(() => {
      const msgs = [
        "[INFO] Đang quét các nền tảng...",
        "[INFO] Hệ thống định tuyến ổn định.",
        "[SYSTEM] Hiệu năng máy chủ tối ưu.",
        "[INFO] Đã phân tích luồng dữ liệu mới.",
      ];
      const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
      setLogs(prev => [...prev.slice(-10), `[${new Date().toLocaleTimeString()}] ${randomMsg}`]);
    }, 4000);
    return () => clearInterval(timer);
  }, [isActivated, tierText]);

  const TABS = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'license', label: 'Quản lý Ứng dụng', icon: Key },
    { id: 'wallet', label: 'Ví điện tử', icon: Wallet },
    { id: 'history', label: 'Lịch sử giao dịch', icon: History },
    { id: 'profile', label: 'Hồ sơ cá nhân', icon: UserCog },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0510] text-zinc-100 font-sans relative overflow-x-hidden">
      
      {/* Ảnh nền Mạch Điện Não Bộ */}
      <div className="absolute inset-0 bg-[url('/circuit-bg.jpg')] bg-cover bg-center bg-fixed opacity-30 z-0 pointer-events-none"></div>
      
      {/* Hiệu ứng tia điện */}
      <div className="absolute inset-0 z-0 opacity-50 pointer-events-none">
         <CircuitAnimation />
      </div>

      {/* Upper Layout */}
      <div className="flex flex-1 relative overflow-hidden z-10">
        
        {/* Backdrop for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/60 md:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside 
          data-testid="hub-sidebar"
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed inset-y-0 left-0 z-50 w-64 border-r border-[#3A2266]/50 bg-[#0B0510]/95 backdrop-blur-xl p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:flex md:bg-[#1A1025]/50`}
        >
          <div className="space-y-8">
            <div className="flex items-center justify-between pb-6 border-b border-[#3A2266]/50/50">
              <Link href="/" className="flex items-center hover:opacity-80 transition shrink-0">
                <img 
                  src="/logo.jpeg" 
                  alt="Logo" 
                  className="w-32 md:w-40 h-auto object-contain mix-blend-screen origin-left" 
                />
              </Link>
              <button
                type="button"
                className="md:hidden p-1 rounded-lg text-zinc-400 hover:text-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <nav className="space-y-1.5">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-gradient-to-r from-neonPurple/20 to-transparent text-white border-l-2 border-neonPurple' 
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50 border-l-2 border-transparent'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-neonPurple' : ''}`} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 shadow-inner">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-neonPurple to-blue-500 flex items-center justify-center text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Guest User</div>
                  <div className="text-xs text-zinc-400">{tierText}</div>
                </div>
              </div>
              <div className="bg-[#0B0510]/50 rounded-lg p-2 flex justify-between items-center border border-[#3A2266]/50/50">
                <span className="text-xs text-zinc-400">Số dư ví:</span>
                <span className="text-sm font-bold text-neonGreen">0 ₫</span>
              </div>
            </div>

            <Link
              href="/login"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-955/20 transition w-full text-left font-medium"
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </Link>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto w-full min-w-0 relative">
          <div className="min-h-full bg-transparent p-4 sm:p-8 pb-16 relative z-10">
            
            <header className="flex justify-between items-center mb-8 border-b border-[#3A2266]/50/50 pb-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="md:hidden p-2 rounded-lg bg-zinc-800/80 text-zinc-300 hover:text-white backdrop-blur"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-6 w-6" />
                </button>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-neonPurple to-blue-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.3)]">
                    {TABS.find(t => t.id === activeTab)?.label || 'Bảng điều khiển'}
                  </h1>
                </div>
              </div>
            </header>

            {/* TAB CONTENT SWITCHER */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  
                  {/* Lời chào */}
                  <div>
                    <h2 className="text-3xl font-extrabold text-white mb-2">Xin chào, Guest User!</h2>
                    <p className="text-zinc-400">Tổng quan tài khoản của bạn</p>
                  </div>

                  {/* Stats Grid */}
                  <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-blue-500/30 bg-zinc-900/50 backdrop-blur p-6 hover:border-blue-500/50 transition flex justify-between items-center group shadow-lg">
                      <div>
                        <p className="text-sm font-medium text-zinc-400 mb-2">Số dư ví</p>
                        <h3 className="text-3xl font-bold text-white group-hover:text-blue-400 transition">0<span className="text-xl text-zinc-500">₫</span></h3>
                      </div>
                      <span className="p-3 rounded-xl bg-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                        <Wallet className="h-6 w-6" />
                      </span>
                    </div>

                    <div className="rounded-xl border border-purple-500/30 bg-zinc-900/50 backdrop-blur p-6 hover:border-purple-500/50 transition flex justify-between items-center group shadow-lg">
                      <div>
                        <p className="text-sm font-medium text-zinc-400 mb-2">Khóa học đã mua</p>
                        <h3 className="text-3xl font-bold text-white group-hover:text-purple-400 transition">0</h3>
                      </div>
                      <span className="p-3 rounded-xl bg-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                        <BookOpen className="h-6 w-6" />
                      </span>
                    </div>

                    <div className="rounded-xl border border-pink-500/30 bg-zinc-900/50 backdrop-blur p-6 hover:border-pink-500/50 transition flex justify-between items-center group shadow-lg">
                      <div>
                        <p className="text-sm font-medium text-zinc-400 mb-2">Công cụ đã mua</p>
                        <h3 className="text-3xl font-bold text-white group-hover:text-pink-400 transition">0</h3>
                      </div>
                      <span className="p-3 rounded-xl bg-pink-500/20 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.2)]">
                        <Hammer className="h-6 w-6" />
                      </span>
                    </div>

                    <div className="rounded-xl border border-neonGreen/30 bg-gradient-to-br from-neonGreen/20 to-[#1A1025] backdrop-blur p-6 hover:border-neonGreen/50 transition flex justify-between items-center group shadow-lg">
                      <div>
                        <p className="text-sm font-medium text-zinc-400 mb-2">Account Tier</p>
                        <h3 className="text-xl font-bold text-neonGreen mt-2">{tierText}</h3>
                      </div>
                      <span className="p-3 rounded-xl bg-neonGreen/20 text-neonGreen shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                        <User className="h-6 w-6" />
                      </span>
                    </div>
                  </section>

                  {/* Main Columns */}
                  <section className="grid gap-6 lg:grid-cols-2">
                    
                    {/* Cột trái: Đã mua gần đây */}
                    <div className="rounded-xl border border-blue-500/30 bg-zinc-900/50 backdrop-blur p-6 flex flex-col min-h-[300px] shadow-xl">
                      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#3A2266]/50/50">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          <ShoppingCart className="w-5 h-5 text-blue-400" /> Đã mua gần đây
                        </h3>
                        <button 
                          onClick={() => setActiveTab('history')}
                          className="text-sm text-zinc-400 hover:text-white flex items-center gap-1 transition"
                        >
                          Xem tất cả <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {isActivated ? (
                        <div className="flex-1 overflow-y-auto max-h-[250px] space-y-3 pr-2 custom-scrollbar">
                          {/* Item 1 */}
                          <div className="w-full flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 hover:border-blue-500/30 transition">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                                <Shield className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-bold text-white text-sm">Ban Content Automation</h4>
                                <p className="text-xs text-zinc-400 mt-0.5">HSD: Vĩnh viễn</p>
                              </div>
                            </div>
                            <span className="px-2 py-1 text-[10px] font-bold bg-green-500/20 text-green-400 rounded-full">
                              Active
                            </span>
                          </div>
                          
                          {/* Item 2 */}
                          <div className="w-full flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 hover:border-purple-500/30 transition">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                                <BookOpen className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-bold text-white text-sm">Khóa học Master Automation</h4>
                                <p className="text-xs text-zinc-400 mt-0.5">HSD: Trọn đời</p>
                              </div>
                            </div>
                            <span className="px-2 py-1 text-[10px] font-bold bg-green-500/20 text-green-400 rounded-full">
                              Active
                            </span>
                          </div>

                          {/* Item 3 */}
                          <div className="w-full flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 hover:border-pink-500/30 transition">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400">
                                <Hammer className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-bold text-white text-sm">Healing Bird Tool</h4>
                                <p className="text-xs text-zinc-400 mt-0.5">HSD: 30/12/2026</p>
                              </div>
                            </div>
                            <span className="px-2 py-1 text-[10px] font-bold bg-green-500/20 text-green-400 rounded-full">
                              Active
                            </span>
                          </div>

                          {/* Item 4 */}
                          <div className="w-full flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 hover:border-orange-500/30 transition">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400">
                                <GitMerge className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-bold text-white text-sm">Quy trình Đăng Reels</h4>
                                <p className="text-xs text-zinc-400 mt-0.5">HSD: Vĩnh viễn</p>
                              </div>
                            </div>
                            <span className="px-2 py-1 text-[10px] font-bold bg-green-500/20 text-green-400 rounded-full">
                              Active
                            </span>
                          </div>

                          {/* Item 5 */}
                          <div className="w-full flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 hover:border-blue-500/30 transition">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-zinc-700/50 flex items-center justify-center text-zinc-400">
                                <Shield className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-bold text-zinc-400 text-sm">Tool Seeding Pro (Hết hạn)</h4>
                                <p className="text-xs text-zinc-500 mt-0.5">HSD: 01/01/2024</p>
                              </div>
                            </div>
                            <span className="px-2 py-1 text-[10px] font-bold bg-zinc-800 text-zinc-500 rounded-full">
                              Expired
                            </span>
                          </div>

                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-center">
                          <span className="text-zinc-500">Chưa có giao dịch nào</span>
                        </div>
                      )}
                    </div>

                    {/* Cột phải: Truy cập nhanh */}
                    <div className="rounded-xl border border-purple-500/30 bg-zinc-900/50 backdrop-blur p-6 shadow-xl">
                      <div className="flex items-center mb-6 pb-4 border-b border-[#3A2266]/50/50">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          <Activity className="w-5 h-5 text-purple-400" /> Truy cập nhanh
                        </h3>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <Link href="/#combos" className="p-4 rounded-xl border border-orange-500/20 bg-orange-500/10 hover:bg-orange-500/20 transition flex flex-col items-center justify-center text-center gap-3 group">
                          <Wallet className="w-8 h-8 text-orange-400 group-hover:scale-110 transition" />
                          <span className="font-semibold text-orange-100">Mua Combo</span>
                        </Link>

                        <Link href="/#tools" className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20 transition flex flex-col items-center justify-center text-center gap-3 group">
                          <Hammer className="w-8 h-8 text-blue-400 group-hover:scale-110 transition" />
                          <span className="font-semibold text-blue-100">Mua công cụ</span>
                        </Link>
                        
                        <Link href="/#courses" className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/10 hover:bg-purple-500/20 transition flex flex-col items-center justify-center text-center gap-3 group">
                          <BookOpen className="w-8 h-8 text-purple-400 group-hover:scale-110 transition" />
                          <span className="font-semibold text-purple-100">Mua Khóa học</span>
                        </Link>

                        <Link href="/#free" className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 transition flex flex-col items-center justify-center text-center gap-3 group">
                          <Download className="w-8 h-8 text-emerald-400 group-hover:scale-110 transition" />
                          <span className="font-semibold text-emerald-100">Miễn Phí</span>
                        </Link>
                      </div>
                    </div>

                  </section>
                </div>
              )}

              {/* LICENSE TAB */}
              {activeTab === 'license' && (
                <div className="space-y-8">
                  {/* Alerts Area */}
                  <div className="space-y-4">
                    {/* Blue Alert */}
                    <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-5 flex items-start gap-4">
                      <div className="mt-0.5">
                        <Key className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-blue-300 text-sm mb-1">Đăng nhập tool bằng tài khoản web</h4>
                        <p className="text-sm text-blue-200/70">
                          Tài khoản và mật khẩu để đăng nhập các tool là tài khoản và mật khẩu bạn dùng để đăng nhập website này. 
                          Nếu quên mật khẩu, bạn có thể <Link href="/#profile" className="underline hover:text-blue-100 transition">đổi mật khẩu tại trang hồ sơ →</Link>
                        </p>
                      </div>
                    </div>

                    {/* Green Alert */}
                    <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-5 flex items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="mt-0.5">
                          <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
                            <Mail className="w-4 h-4" />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-bold text-green-300 text-sm mb-1">Cần hỗ trợ?</h4>
                          <p className="text-sm text-green-200/70">Liên hệ đội ngũ CSKH khi gặp vấn đề về cài đặt, kích hoạt hay sử dụng tool.</p>
                        </div>
                      </div>
                      <button className="whitespace-nowrap px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg text-sm transition shadow-lg shadow-green-500/20 flex items-center gap-2">
                        <Mail className="w-4 h-4" /> Liên hệ hỗ trợ
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Lock className="w-5 h-5 text-neonPurple" /> Ứng dụng đã sở hữu</h3>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-2xl border border-[#3A2266]/50/80 bg-[#1A1025]/50 backdrop-blur overflow-hidden group">
                      <div className="h-32 bg-zinc-800 relative flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent z-10"></div>
                        <img src="/software-box.jpg" alt="Ban Content" className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition duration-700" />
                        <div className="absolute top-3 right-3 z-20">
                          {isVip || isUltimate ? (
                            <span className="px-2.5 py-1 text-xs font-bold bg-neonGreen/20 text-neonGreen border border-neonGreen/30 rounded-full flex items-center gap-1 shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                              <Shield className="w-3 h-3" /> Active
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 text-xs font-bold bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Locked
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-lg text-white mb-1">Ban Content Automation</h3>
                        <p className="text-zinc-400 text-sm mb-4">Phiên bản All-in-one v3.0 bảo vệ kênh YouTube.</p>
                        <button className={`w-full py-2.5 rounded-lg font-bold text-sm transition ${isVip || isUltimate ? 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700' : 'bg-neonPurple hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'}`}>
                          {isVip || isUltimate ? 'Mở Công Cụ' : 'Nâng Cấp VIP'}
                        </button>
                      </div>
                    </div>

                    {/* Tool 2 */}
                    <div className="rounded-2xl border border-[#3A2266]/50/80 bg-[#1A1025]/50 backdrop-blur overflow-hidden group">
                      <div className="h-32 bg-zinc-800 relative flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent z-10"></div>
                        <img src="/software-box-2.jpg" alt="Healing Bird" className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition duration-700" />
                        <div className="absolute top-3 right-3 z-20">
                          {isUltimate ? (
                            <span className="px-2.5 py-1 text-xs font-bold bg-neonGreen/20 text-neonGreen border border-neonGreen/30 rounded-full flex items-center gap-1 shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                              <Shield className="w-3 h-3" /> Active
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 text-xs font-bold bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Locked
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-lg text-white mb-1">Healing Bird Tool</h3>
                        <p className="text-zinc-400 text-sm mb-4">Công cụ AI Render Video thiên nhiên dài hàng giờ.</p>
                        <button className={`w-full py-2.5 rounded-lg font-bold text-sm transition ${isUltimate ? 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700' : 'bg-neonPurple hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'}`}>
                          {isUltimate ? 'Mở Công Cụ' : 'Nâng Cấp Ultimate'}
                        </button>
                      </div>
                    </div>
                    </div>
                  </div>

                  <div className="pt-8 mt-8 border-t border-[#3A2266]/50/50">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-neonGreen" /> Có thể bạn quan tâm
                      </h3>
                      <span className="px-3 py-1 bg-red-500/10 text-red-400 text-xs font-bold rounded-full border border-red-500/20">🔥 HOT SALE</span>
                    </div>
                    
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {/* Combo Sale */}
                      <div className="rounded-2xl border border-neonPurple/30 bg-[#1A1025]/50 backdrop-blur overflow-hidden group hover:border-neonPurple transition">
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                              <Wallet className="w-6 h-6" />
                            </div>
                            <span className="px-2.5 py-1 text-xs font-bold bg-red-500 text-white rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                              -30%
                            </span>
                          </div>
                          <h3 className="font-bold text-lg text-white mb-1">Combo Khởi nghiệp</h3>
                          <p className="text-zinc-400 text-sm mb-4 line-clamp-2">Bao gồm Ban Content VIP, Tool Seeding Pro và Proxy 1 tháng.</p>
                          <div className="flex items-center justify-between mt-auto">
                            <div>
                              <span className="text-xs text-zinc-500 line-through">1.500.000đ</span>
                              <div className="text-lg font-bold text-neonPurple">990.000đ</div>
                            </div>
                            <button className="px-4 py-2 rounded-lg bg-neonPurple hover:bg-purple-500 text-white font-bold text-sm shadow-[0_0_15px_rgba(168,85,247,0.4)] transition">
                              Mua ngay
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Course */}
                      <div className="rounded-2xl border border-[#3A2266]/50/80 bg-[#1A1025]/50 backdrop-blur overflow-hidden group hover:border-blue-500/50 transition">
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                              <BookOpen className="w-6 h-6" />
                            </div>
                            <span className="px-2.5 py-1 text-xs font-bold bg-blue-500 text-white rounded-full">
                              New
                            </span>
                          </div>
                          <h3 className="font-bold text-lg text-white mb-1">Khóa học Master n8n</h3>
                          <p className="text-zinc-400 text-sm mb-4 line-clamp-2">Làm chủ tự động hóa Workflow Marketing với n8n từ A-Z.</p>
                          <div className="flex items-center justify-between mt-auto">
                            <div>
                              <div className="text-lg font-bold text-blue-400">2.000.000đ</div>
                            </div>
                            <button className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm border border-zinc-700 transition">
                              Xem chi tiết
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Tool Sale */}
                      <div className="rounded-2xl border border-[#3A2266]/50/80 bg-[#1A1025]/50 backdrop-blur overflow-hidden group hover:border-pink-500/50 transition">
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-400">
                              <Hammer className="w-6 h-6" />
                            </div>
                            <span className="px-2.5 py-1 text-xs font-bold bg-red-500 text-white rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                              -50%
                            </span>
                          </div>
                          <h3 className="font-bold text-lg text-white mb-1">Tool Seeding TikTok</h3>
                          <p className="text-zinc-400 text-sm mb-4 line-clamp-2">Tăng tương tác, view và followers hoàn toàn tự động.</p>
                          <div className="flex items-center justify-between mt-auto">
                            <div>
                              <span className="text-xs text-zinc-500 line-through">800.000đ</span>
                              <div className="text-lg font-bold text-pink-400">400.000đ</div>
                            </div>
                            <button className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm border border-zinc-700 transition">
                              Mua ngay
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* WALLET TAB */}
              {activeTab === 'wallet' && (
                <div className="space-y-6 bg-[#0B0510] p-1 rounded-2xl">
                  {/* Header: Balance & Buttons */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900/50 backdrop-blur border border-blue-500/30 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                        <Wallet className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-zinc-400 text-sm mb-1">Số dư hiện tại</p>
                        <h2 className="text-3xl font-bold text-blue-400 flex items-baseline gap-1">{(userData?.walletBalance || 0).toLocaleString('vi-VN')} <span className="text-xl">VNĐ</span></h2>
                        <p className="text-xs text-zinc-500 mt-1">Tiền nạp: <span className="text-emerald-400 font-bold">{(userData?.walletBalance || 0).toLocaleString('vi-VN')} VNĐ</span></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setActiveTab('history')}
                        className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium transition flex items-center gap-2 border border-zinc-700"
                      >
                        <History className="w-4 h-4" /> Lịch Sử Giao Dịch
                      </button>
                    </div>
                  </div>

                  {/* Payment Method Tabs */}
                  <div className="flex gap-2 border-b border-[#3A2266]/50 pb-4 mt-2">
                    <button className="px-6 py-2.5 rounded-lg bg-zinc-800 text-white text-sm font-bold flex items-center gap-2 shadow-md">
                      <Building2 className="w-4 h-4" /> Chuyển khoản
                    </button>
                    <button className="px-6 py-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 text-sm font-medium transition flex items-center gap-2">
                      <CreditCard className="w-4 h-4" /> Visa / PayPal
                    </button>
                  </div>

                  {/* Main Split Content */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
                    {/* Left Column: Nạp tiền */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-bold text-white mb-2">Hướng dẫn nạp tiền</h3>
                      
                      {/* Step 1 */}
                      <div className="flex items-center gap-3 p-3 bg-[#1A1025]/50 border border-[#3A2266]/50 rounded-lg">
                        <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.5)]">1</div>
                        <span className="text-sm text-zinc-300 font-medium">Chọn số tiền</span>
                      </div>

                      {/* Step 1.5 - Text Label */}
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.5)]">1</div>
                        <span className="text-sm text-zinc-300 font-medium">Chọn Số Tiền Cần Nạp</span>
                      </div>

                      {/* Amounts Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        {[50000, 100000, 200000, 500000, 1000000].map((val, idx) => (
                          <button 
                            key={idx} 
                            onClick={() => setAmount(val)}
                            className={`py-3 px-4 text-sm text-center font-bold rounded-lg border transition ${amount === val ? 'border-blue-500 bg-blue-500/20 text-blue-400' : 'border-zinc-700 hover:border-blue-500 hover:bg-blue-500/10 text-zinc-300'}`}
                          >
                            {val.toLocaleString('vi-VN')} VNĐ
                          </button>
                        ))}
                      </div>

                      <input 
                        type="text" 
                        value={amount ? amount.toLocaleString('vi-VN') : ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setAmount(val ? Number(val) : '');
                        }}
                        placeholder="Hoặc nhập số tiền khác" 
                        className="w-full p-4 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 transition"
                      />

                      {/* Transfer Info Box */}
                      <div className="bg-zinc-900/50 border border-blue-500/20 rounded-xl p-5 space-y-4 shadow-xl">
                        <h4 className="font-bold text-white border-b border-[#3A2266]/50 pb-3">Thông tin chuyển khoản</h4>
                        
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-zinc-400">Ngân hàng:</span>
                          <span className="font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">MB Bank</span>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-zinc-400">Số tài khoản:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">1434949495</span>
                            <Copy className="w-4 h-4 text-zinc-500 cursor-pointer hover:text-white" />
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                          <span className="text-zinc-400">Chủ tài khoản:</span>
                          <span className="font-bold text-white text-right">Truong Thi Thuy</span>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                          <span className="text-zinc-400">Số tiền:</span>
                          <span className="font-bold text-blue-400">{amount ? amount.toLocaleString('vi-VN') + ' VNĐ' : 'Chưa chọn'}</span>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                          <span className="text-zinc-400">Nội dung CK:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-rose-500">NAPTIEN BANCONTENT</span>
                            <Copy className="w-4 h-4 text-zinc-500 cursor-pointer hover:text-white" />
                          </div>
                        </div>
                      </div>

                      {/* Alert Box */}
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-5 shadow-lg">
                        <h4 className="font-bold text-yellow-500 text-sm mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5" /> Lưu ý quan trọng
                        </h4>
                        <ul className="text-sm text-yellow-500/80 space-y-2 list-disc list-inside">
                          <li>Chuyển khoản <span className="font-bold text-yellow-500">đúng số tiền</span> đã chọn</li>
                          <li>Nhập <span className="font-bold text-yellow-500">chính xác nội dung</span> chuyển khoản</li>
                          <li>Chuyển khoản <span className="font-bold text-yellow-500">đúng nội dung</span>, hệ thống sẽ xử lý giao dịch trong ít phút</li>
                        </ul>
                      </div>

                      {/* Support Box */}
                      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-5 shadow-lg">
                        <h4 className="font-bold text-blue-400 text-sm mb-2 flex items-center gap-2">
                          <Headset className="w-5 h-5" /> Cần hỗ trợ? Bấm vào để liên hệ ngay
                        </h4>
                        <p className="text-xs text-zinc-400 mb-4 leading-relaxed">Nếu đã chuyển khoản nhưng tiền chưa vào ví sau 5 phút hoặc gặp lỗi giao dịch — vui lòng liên hệ kèm mã tham chiếu + ảnh chụp giao dịch. Bấm vào nút bên dưới để mở app trực tiếp.</p>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 border border-[#3A2266]/50 bg-[#1A1025]/50 rounded-lg flex items-center justify-between group cursor-pointer hover:border-blue-500 transition">
                            <div>
                              <p className="text-[10px] text-zinc-500 font-bold mb-1">ĐIỆN THOẠI</p>
                              <p className="text-sm font-medium text-zinc-300 group-hover:text-white">0945711275</p>
                            </div>
                            <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-blue-400" />
                          </div>
                          <div className="p-3 border border-[#3A2266]/50 bg-[#1A1025]/50 rounded-lg flex items-center justify-between group cursor-pointer hover:border-blue-500 transition">
                            <div>
                              <p className="text-[10px] text-zinc-500 font-bold mb-1">ZALO</p>
                              <p className="text-sm font-medium text-zinc-300 group-hover:text-white truncate max-w-[100px]">zalo.me/g/nkgug288</p>
                            </div>
                            <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-blue-400" />
                          </div>
                          <div className="p-3 border border-[#3A2266]/50 bg-[#1A1025]/50 rounded-lg flex items-center justify-between group cursor-pointer hover:border-blue-500 transition">
                            <div>
                              <p className="text-[10px] text-zinc-500 font-bold mb-1">TELEGRAM</p>
                              <p className="text-sm font-medium text-zinc-300 group-hover:text-white truncate max-w-[100px]">+xA2lu1SgJPA3MmU1</p>
                            </div>
                            <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-blue-400" />
                          </div>
                          <div className="p-3 border border-[#3A2266]/50 bg-[#1A1025]/50 rounded-lg flex items-center justify-between group cursor-pointer hover:border-blue-500 transition">
                            <div>
                              <p className="text-[10px] text-zinc-500 font-bold mb-1">EMAIL</p>
                              <p className="text-sm font-medium text-zinc-300 group-hover:text-white truncate max-w-[100px]">chinhcongdaklak@gmail.com</p>
                            </div>
                            <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-blue-400" />
                          </div>
                          <div className="col-span-2 p-3 border border-[#3A2266]/50 bg-[#1A1025]/50 rounded-lg flex items-center justify-between group cursor-pointer hover:border-blue-500 transition">
                            <div>
                              <p className="text-[10px] text-zinc-500 font-bold mb-1">FACEBOOK</p>
                              <p className="text-sm font-medium text-zinc-300 group-hover:text-white">Mở Messenger</p>
                            </div>
                            <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-blue-400" />
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Right Column: PayOS Checkout */}
                    <div className="space-y-6 pt-12 lg:pt-0">
                      {/* Step 2 */}
                      <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                        <div className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.5)]">2</div>
                        <span className="text-sm text-emerald-400 font-bold">Thanh toán an toàn qua PayOS</span>
                      </div>

                      <div className="bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-2xl p-8 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden border border-[#3A2266]">
                         <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-neonPurple via-blue-500 to-emerald-400"></div>
                         
                         <div className="w-20 h-20 mb-6 bg-white rounded-2xl p-2 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                           <span className="text-2xl font-black text-blue-600 tracking-tighter">PayOS</span>
                         </div>

                         <div className="text-center space-y-2 mb-8">
                           <h3 className="text-xl font-bold text-white">Nạp tiền vào Ví tự động</h3>
                           <p className="text-zinc-400 text-sm">Quét mã QR qua cổng PayOS. Tiền sẽ vào ví tự động trong 3 giây.</p>
                         </div>

                         <div className="w-full space-y-4 text-center">
                           <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                             <p className="text-sm text-zinc-500 mb-1">Số tiền sẽ thanh toán</p>
                             <p className="text-3xl font-bold text-blue-400">{amount ? amount.toLocaleString('vi-VN') : 0} <span className="text-lg">VNĐ</span></p>
                           </div>

                           <button 
                             onClick={handlePayment}
                             disabled={isLoadingPayment || !amount || amount < 2000}
                             className="w-full py-4 bg-gradient-to-r from-blue-600 to-neonPurple hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl text-lg shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                           >
                             {isLoadingPayment ? (
                               <>
                                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                 Đang tạo mã...
                               </>
                             ) : (
                               <>
                                 <QrCode className="w-5 h-5" /> Tiến Hành Thanh Toán
                               </>
                             )}
                           </button>
                         </div>
                      </div>

                    </div>
                  </div>
                </div>
              )}

              {/* HISTORY TAB */}
              {activeTab === 'history' && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white">Lịch Sử Giao Dịch</h2>
                      <p className="text-sm text-zinc-400">Xem và quản lý lịch sử giao dịch ví của bạn.</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('wallet')}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition flex items-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                    >
                      <ChevronLeft className="w-4 h-4" /> Quay lại Ví
                    </button>
                  </div>

                  {/* 4 Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-zinc-900/50 backdrop-blur border border-emerald-500/30 p-5 rounded-2xl relative overflow-hidden group shadow-lg">
                      <div className="absolute top-0 right-0 p-4">
                        <ArrowDownRight className="w-5 h-5 text-emerald-500" />
                      </div>
                      <p className="text-sm font-medium text-zinc-400 mb-2">Tổng Nạp</p>
                      <h3 className="text-2xl font-bold text-white">0 <span className="text-sm">VNĐ</span></h3>
                      <p className="text-xs text-zinc-500 mt-1">Đã nạp thành công</p>
                    </div>
                    
                    <div className="bg-zinc-900/50 backdrop-blur border border-rose-500/30 p-5 rounded-2xl relative overflow-hidden group shadow-lg">
                      <div className="absolute top-0 right-0 p-4">
                        <ArrowUpRight className="w-5 h-5 text-rose-500" />
                      </div>
                      <p className="text-sm font-medium text-zinc-400 mb-2">Tổng Chi</p>
                      <h3 className="text-2xl font-bold text-white">0 <span className="text-sm">VNĐ</span></h3>
                      <p className="text-xs text-zinc-500 mt-1">Đã sử dụng</p>
                    </div>

                    <div className="bg-zinc-900/50 backdrop-blur border border-yellow-500/30 p-5 rounded-2xl relative overflow-hidden group shadow-lg">
                      <div className="absolute top-0 right-0 p-4">
                        <Calendar className="w-5 h-5 text-yellow-500" />
                      </div>
                      <p className="text-sm font-medium text-zinc-400 mb-2">Đang Chờ</p>
                      <h3 className="text-2xl font-bold text-white">0 <span className="text-sm">VNĐ</span></h3>
                      <p className="text-xs text-zinc-500 mt-1">Chờ xác nhận</p>
                    </div>

                    <div className="bg-zinc-900/50 backdrop-blur border border-blue-500/30 p-5 rounded-2xl relative overflow-hidden group shadow-lg">
                      <div className="absolute top-0 right-0 p-4">
                        <Download className="w-5 h-5 text-blue-500" />
                      </div>
                      <p className="text-sm font-medium text-zinc-400 mb-2">Số Giao Dịch</p>
                      <h3 className="text-2xl font-bold text-white">0</h3>
                      <p className="text-xs text-zinc-500 mt-1">Tổng số giao dịch</p>
                    </div>
                  </div>

                  {/* Filter & Table Area */}
                  <div className="bg-zinc-900/50 backdrop-blur border border-purple-500/20 rounded-2xl overflow-hidden shadow-xl">
                    {/* Filter Row */}
                    <div className="p-5 border-b border-[#3A2266]/50/80 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                      <div>
                        <h3 className="font-bold text-white text-lg">Chi Tiết Giao Dịch</h3>
                        <p className="text-xs text-zinc-400">Danh sách chi tiết tất cả giao dịch trong ví của bạn.</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                        <div className="relative flex-grow xl:flex-grow-0">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                          <input type="text" placeholder="Tìm kiếm..." className="w-full xl:w-48 pl-9 pr-4 py-2 bg-[#0B0510] border border-[#3A2266]/50 rounded-lg text-sm text-white focus:outline-none focus:border-neonPurple transition" />
                        </div>
                        <div className="relative">
                          <select className="appearance-none pl-4 pr-8 py-2 bg-[#0B0510] border border-[#3A2266]/50 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-neonPurple transition">
                            <option>Tất cả loại</option>
                            <option>Nạp tiền</option>
                            <option>Thanh toán</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                        </div>
                        <div className="relative">
                          <select className="appearance-none pl-4 pr-8 py-2 bg-[#0B0510] border border-[#3A2266]/50 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-neonPurple transition">
                            <option>Tất cả trạng thái</option>
                            <option>Thành công</option>
                            <option>Thất bại</option>
                            <option>Đang chờ</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                        </div>
                        <div className="flex items-center gap-2 bg-[#0B0510] border border-[#3A2266]/50 rounded-lg px-3 py-1.5">
                          <input type="date" className="bg-transparent text-sm text-zinc-300 focus:outline-none [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert opacity-80" />
                          <span className="text-zinc-500 text-xs">đến</span>
                          <input type="date" className="bg-transparent text-sm text-zinc-300 focus:outline-none [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert opacity-80" />
                        </div>
                        <button className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium transition flex items-center gap-2 border border-zinc-700">
                          <Download className="w-4 h-4" /> Xuất CSV
                        </button>
                      </div>
                    </div>

                    {/* Table Content */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-zinc-400">
                        <thead className="text-xs uppercase bg-[#0B0510]/50 text-zinc-500 border-b border-[#3A2266]/50/80">
                          <tr>
                            <th className="px-6 py-4 font-medium whitespace-nowrap">Loại</th>
                            <th className="px-6 py-4 font-medium whitespace-nowrap">Số Tiền</th>
                            <th className="px-6 py-4 font-medium whitespace-nowrap">Mô Tả</th>
                            <th className="px-6 py-4 font-medium whitespace-nowrap">Mã Tham Chiếu</th>
                            <th className="px-6 py-4 font-medium whitespace-nowrap">Trạng Thái</th>
                            <th className="px-6 py-4 font-medium whitespace-nowrap">Ngày</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Empty State inside table */}
                          <tr>
                            <td colSpan={6} className="px-6 py-20 text-center">
                              <div className="flex flex-col items-center justify-center">
                                <Inbox className="w-12 h-12 text-zinc-600 mb-4" />
                                <p className="text-lg font-medium text-zinc-300 mb-1">Không tìm thấy giao dịch</p>
                                <p className="text-sm text-zinc-500">Bắt đầu bằng cách nạp tiền vào ví</p>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* PROFILE TAB */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  {/* Banner & Header */}
                  <div className="bg-gradient-to-r from-neonPurple to-blue-600 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.3)] group/banner">
                    <div className="absolute inset-0 bg-[url('/circuit-bg.jpg')] bg-cover opacity-10 mix-blend-overlay transition duration-500 group-hover/banner:scale-105"></div>
                    <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                      
                      {/* Avatar with Camera Overlay */}
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center overflow-hidden shrink-0 shadow-xl relative group/avatar cursor-pointer"
                      >
                        <User className="w-12 h-12 text-white/80 transition group-hover/avatar:opacity-0" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition">
                          <Camera className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      
                      <div className="text-center md:text-left">
                        <h2 className="text-3xl font-bold text-white mb-1">Vo Bao</h2>
                        <p className="text-white/80 font-medium mb-3">@baovommo_b3b5</p>
                        <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm border border-white/10">
                          Người dùng
                        </span>
                      </div>
                    </div>
                    
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => {
                        // Demo alert to confirm action
                        if (e.target.files && e.target.files.length > 0) {
                          alert('Đã chọn file: ' + e.target.files[0].name + '. Tính năng Upload sẽ được kích hoạt sau khi có API!');
                        }
                      }}
                    />
                    
                    <div className="flex flex-wrap gap-3 relative z-10 mt-4 md:mt-0">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-white text-sm font-medium transition flex items-center gap-2"
                      >
                        <Camera className="w-4 h-4" /> Đổi Avatar / Cover
                      </button>
                      <button 
                        onClick={() => setIsEditProfileOpen(true)}
                        className="px-4 py-2 rounded-lg bg-neonPurple/80 hover:bg-neonPurple backdrop-blur border border-neonPurple text-white text-sm font-bold transition flex items-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                      >
                        <Edit2 className="w-4 h-4" /> Chỉnh sửa hồ sơ
                      </button>
                    </div>
                  </div>

                  {/* Sub-tabs Navigation (Removed) */}

                  {/* 4 Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                    <div className="bg-zinc-900/50 backdrop-blur border border-purple-500/30 p-5 rounded-2xl relative shadow-lg">
                      <div className="flex justify-between items-start mb-4">
                        <p className="text-sm font-bold text-white">Tổng số Ứng dụng</p>
                        <Key className="w-4 h-4 text-purple-400" />
                      </div>
                      <h3 className="text-3xl font-bold text-white mb-2">0</h3>
                      <p className="text-xs text-zinc-400">Đã mua từ trước đến nay</p>
                    </div>
                    
                    <div className="bg-zinc-900/50 backdrop-blur border border-emerald-500/30 p-5 rounded-2xl relative shadow-lg">
                      <div className="flex justify-between items-start mb-4">
                        <p className="text-sm font-bold text-white">Ứng dụng đang hoạt động</p>
                        <Shield className="w-4 h-4 text-emerald-400" />
                      </div>
                      <h3 className="text-3xl font-bold text-emerald-400 mb-2">0</h3>
                      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-2">
                        <div className="h-full bg-emerald-500 w-[10%] opacity-50"></div>
                      </div>
                    </div>

                    <div className="bg-zinc-900/50 backdrop-blur border border-rose-500/30 p-5 rounded-2xl relative shadow-lg">
                      <div className="flex justify-between items-start mb-4">
                        <p className="text-sm font-bold text-white">Ứng dụng đã hết hạn</p>
                        <Clock className="w-4 h-4 text-rose-400" />
                      </div>
                      <h3 className="text-3xl font-bold text-rose-400 mb-2">0</h3>
                      <p className="text-xs text-zinc-400">Cần gia hạn</p>
                    </div>

                    <div className="bg-zinc-900/50 backdrop-blur border border-blue-500/30 p-5 rounded-2xl relative shadow-lg">
                      <div className="flex justify-between items-start mb-4">
                        <p className="text-sm font-bold text-white">Thành viên từ</p>
                        <Calendar className="w-4 h-4 text-blue-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-1">2026</h3>
                      <p className="text-xs text-zinc-400">11:22 20 thg 6, 2026</p>
                    </div>
                  </div>

                  {/* Edit Profile Modal */}
                  {isEditProfileOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                      {/* Overlay */}
                      <div 
                        className="absolute inset-0 bg-[#0B0510]/80 backdrop-blur-sm transition-opacity" 
                        onClick={() => setIsEditProfileOpen(false)}
                      ></div>
                      
                      {/* Modal Panel */}
                      <div className="relative w-full max-w-2xl bg-gradient-to-br from-[#2D1B4E] to-[#0B0510] border border-neonPurple/50 rounded-2xl shadow-[0_0_40px_rgba(168,85,247,0.2)] overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-[#3A2266] flex justify-between items-center bg-[#1A1025]/50">
                          <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Edit2 className="w-5 h-5 text-neonPurple" />
                            Chỉnh sửa hồ sơ cá nhân
                          </h3>
                          <button 
                            onClick={() => setIsEditProfileOpen(false)} 
                            className="p-1.5 rounded-lg bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-700 transition"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        
                        {/* Body */}
                        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-zinc-300">Email (Không thể đổi)</label>
                              <input type="email" value="baovommo@gmail.com" disabled className="w-full bg-[#0B0510]/50 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-zinc-500 cursor-not-allowed" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-white">Họ và tên</label>
                              <input type="text" defaultValue="Vo Bao" className="w-full bg-[#1A1025] border border-[#3A2266] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neonPurple focus:ring-1 focus:ring-neonPurple transition" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <label className="text-sm font-medium text-white">Số điện thoại</label>
                              <input type="text" defaultValue="0123456789" className="w-full bg-[#1A1025] border border-[#3A2266] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neonPurple focus:ring-1 focus:ring-neonPurple transition" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <label className="text-sm font-medium text-white">Địa chỉ <span className="text-zinc-500 font-normal">(tùy chọn)</span></label>
                              <input type="text" placeholder="VD: 108 Y Wang, P. Ea Kao, TP. Buôn Ma Thuột" className="w-full bg-[#1A1025] border border-[#3A2266] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neonPurple focus:ring-1 focus:ring-neonPurple transition" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <label className="text-sm font-medium text-white">Số CCCD/CMND <span className="text-zinc-500 font-normal">(tùy chọn - bảo mật)</span></label>
                              <input type="text" placeholder="12 chữ số" className="w-full bg-[#1A1025] border border-[#3A2266] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neonPurple focus:ring-1 focus:ring-neonPurple transition" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <label className="text-sm font-medium text-white">Tiểu sử / Giới thiệu <span className="text-zinc-500 font-normal">(tùy chọn)</span></label>
                              <textarea rows={3} placeholder="Viết vài lời giới thiệu về bạn..." className="w-full bg-[#1A1025] border border-[#3A2266] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neonPurple focus:ring-1 focus:ring-neonPurple transition resize-none"></textarea>
                            </div>
                          </div>
                        </div>
                        
                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-[#3A2266] flex justify-end gap-3 bg-[#1A1025]/50">
                          <button 
                            onClick={() => setIsEditProfileOpen(false)}
                            className="px-5 py-2.5 rounded-lg bg-transparent hover:bg-zinc-800 text-zinc-300 font-medium transition"
                          >
                            Hủy bỏ
                          </button>
                          <button 
                            onClick={() => {
                              alert('Đã lưu thông tin thành công!');
                              setIsEditProfileOpen(false);
                            }}
                            className="px-6 py-2.5 rounded-lg bg-neonPurple hover:bg-purple-500 text-white font-bold transition shadow-[0_0_15px_rgba(168,85,247,0.4)] flex items-center gap-2"
                          >
                            <CheckSquare className="w-4 h-4" />
                            Lưu thông tin
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Password Section */}
                  <div className="bg-zinc-900/50 backdrop-blur border border-yellow-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                      <Lock className="w-48 h-48" />
                    </div>
                    <div className="mb-6 border-b border-zinc-700/50 pb-4 relative z-10">
                      <div className="flex items-center gap-2 text-yellow-500 mb-1">
                        <Lock className="w-4 h-4" />
                        <h3 className="text-lg font-bold">Đặt mật khẩu để kích hoạt ứng dụng</h3>
                      </div>
                      <p className="text-xs text-zinc-400">Tài khoản Google chưa có mật khẩu. Đặt mật khẩu để đăng nhập phần mềm kích hoạt key.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4 relative z-10">
                      <div className="space-y-2 relative">
                        <label className="text-xs font-medium text-zinc-300">Mật khẩu mới</label>
                        <div className="relative">
                          <input type="password" placeholder="••••••••••" className="w-full bg-[#0B0510]/80 border border-zinc-700 rounded-lg pl-4 pr-10 py-2 text-sm text-white focus:outline-none focus:border-yellow-500 transition" />
                          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2 relative">
                        <label className="text-xs font-medium text-zinc-300">Xác nhận mật khẩu</label>
                        <div className="relative">
                          <input type="password" placeholder="••••••••••" className="w-full bg-[#0B0510]/80 border border-zinc-700 rounded-lg pl-4 pr-10 py-2 text-sm text-white focus:outline-none focus:border-yellow-500 transition" />
                          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-xs text-zinc-400 mb-6 relative z-10">Tối thiểu 10 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.</p>
                    
                    <div className="flex justify-end relative z-10">
                      <button className="px-6 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-white text-sm font-bold transition shadow-[0_0_15px_rgba(202,138,4,0.4)]">
                        Đặt mật khẩu
                      </button>
                    </div>
                  </div>

                  {/* Recent Activity Section */}
                  <div className="bg-zinc-900/50 backdrop-blur border border-blue-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                      <Activity className="w-48 h-48" />
                    </div>
                    <div className="flex items-center gap-3 mb-6 border-b border-zinc-700/50 pb-4 relative z-10">
                      <Activity className="w-5 h-5 text-blue-400" />
                      <h3 className="text-lg font-bold text-white">Hoạt động gần đây</h3>
                    </div>
                    
                    <div className="space-y-4 relative z-10">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 p-3 hover:bg-zinc-800/50 rounded-lg border border-transparent hover:border-zinc-700 transition">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                            <Lock className="w-4 h-4 text-yellow-400" />
                          </div>
                          <span className="text-sm font-medium text-white">login success</span>
                        </div>
                        <span className="text-xs text-zinc-400">20/6/2026</span>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* EMPTY STATES FOR OTHERS */}
              {['workflows', 'courses'].includes(activeTab) && (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl border border-[#3A2266]/50/80 bg-zinc-900/30 backdrop-blur">
                  <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mb-6 border border-zinc-700">
                    <LayoutDashboard className="w-10 h-10 text-zinc-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Chưa có dữ liệu</h3>
                  <p className="text-zinc-400 max-w-md mx-auto mb-8">
                    Module "{TABS.find(t => t.id === activeTab)?.label}" hiện đang trống hoặc đang trong quá trình phát triển. Vui lòng quay lại sau.
                  </p>
                  <button 
                    onClick={() => setActiveTab('overview')}
                    className="px-6 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition"
                  >
                    Quay lại Tổng quan
                  </button>
                </div>
              )}

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function Hub() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B0510] text-zinc-400 flex items-center justify-center">Loading dashboard...</div>}>
      <HubContent />
    </Suspense>
  );
}
