## 2026-06-18T17:47:47Z

You are the Milestone 2 Worker (Round 2). Your task is to update the application pages to address reviewer feedback by adding real GSAP scroll animation logic and implementing the complete, beautiful App Hub UI design.

Please overwrite the following two files:

1. Overwrite `E:\Youtube\Ban Content\Web\app\page.tsx` with the following GSAP-driven ScrollTrigger implementation:
```tsx
"use client";

import { useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Pricing from '@/components/Pricing';
import Footer from '@/components/Footer';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function Home() {
  const sectionRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Register scroll trigger client-side
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const trigger = triggerRef.current;
    const image = imageRef.current;

    if (!section || !trigger) return;

    // Pin the sticky wrapper as the user scrolls
    const pinTrigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      pin: trigger,
      scrub: true,
    });

    // Create a GSAP timeline for scroll animations
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
      }
    });

    // Animate background image opacity & text overlay
    tl.to(image, { opacity: 0.8 })
      .fromTo(
        "[data-testid='scroll-text-overlay']",
        { opacity: 0.2, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.5 },
        "<"
      );

    return () => {
      pinTrigger.kill();
      tl.kill();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-x-hidden">
      <Header />
      
      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-24 text-center">
        <div className="max-w-3xl space-y-6">
          <h1 
            data-testid="hero-heading"
            className="text-5xl font-extrabold tracking-tight sm:text-6xl text-white"
          >
            Ban Content AI <span className="text-purple-500">Automation</span>
          </h1>
          <p 
            data-testid="hero-subtitle"
            className="text-xl text-zinc-400"
          >
            Elevate your production with lightning-fast automation. Experience the landing page and interactive hub.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/hub" 
              data-testid="hero-cta-hub"
              className="px-6 py-3 rounded-lg bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition"
            >
              Go to App Hub
            </Link>
            <a 
              href="#pricing" 
              data-testid="hero-cta-pricing"
              className="px-6 py-3 rounded-lg border border-zinc-700 hover:border-purple-500 hover:text-purple-400 transition"
            >
              View Pricing
            </a>
          </div>
        </div>
      </main>

      {/* Scroll Sequence GSAP Section */}
      <section 
        ref={sectionRef}
        id="features"
        data-testid="scroll-sequence-section"
        className="relative min-h-[150vh] w-full bg-zinc-950"
      >
        <div 
          ref={triggerRef}
          data-testid="scroll-sticky-wrapper"
          className="sticky top-16 flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center overflow-hidden"
        >
          <div 
            ref={imageRef}
            data-testid="scroll-image"
            className="absolute inset-0 z-0 h-full w-full bg-cover bg-center opacity-30 transition-all duration-300"
            style={{ width: '100%', height: '100%', backgroundImage: "url('/assets/sequence-placeholder.jpg')" }}
          />
          <div 
            data-testid="scroll-text-overlay"
            className="relative z-10 px-4 text-center max-w-2xl bg-zinc-950/70 py-8 px-6 rounded-xl border border-zinc-800/80 backdrop-blur-sm"
          >
            <h3 className="text-3xl font-bold text-white mb-2">Revolutionary Automation</h3>
            <p className="text-zinc-400">
              Our advanced GSAP-driven ScrollTrigger algorithms automatically scan and ban unwanted content across all channels.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <Pricing />

      <Footer />
    </div>
  );
}
```

2. Overwrite `E:\Youtube\Ban Content\Web\app\hub\page.tsx` with the following fully detailed dashboard implementation that satisfies all UI requirements (B.T AI Labs glow header, AUTO RUN purple button, blue/green/orange/red buttons, green ticks on active checkboxes, Tool Cards with lock buttons, terminal log, and footer bottom bar):
```tsx
"use client";

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Shield, Activity, Cpu, LogOut, BarChart3, Settings, 
  LayoutDashboard, User, Lock, Mail, Play, Hammer, CheckSquare, Square 
} from 'lucide-react';

function HubContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');
  const billing = searchParams.get('billing');

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
    "[SYSTEM] Khởi động Ban Content Hub...",
    "[SYSTEM] Đang nạp cấu hình hệ thống...",
  ]);

  useEffect(() => {
    if (!isActivated) {
      setLogs(prev => [...prev, "[WARNING] Chế độ Khách: Một số tính năng bị khóa. Hãy mua gói VIP/Ultimate để mở khóa."]);
      return;
    }
    setLogs(prev => [...prev, `[SUCCESS] Đã kết nối gói dịch vụ: ${tierText}`]);
    const timer = setInterval(() => {
      const msgs = [
        "[INFO] Đang quét kênh YouTube hoạt động...",
        "[INFO] Không phát hiện nội dung vi phạm mới.",
        "[SYSTEM] Hiệu năng máy chủ ổn định.",
        "[INFO] Đã phân tích 12 video trong hàng đợi.",
      ];
      const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
      setLogs(prev => [...prev.slice(-10), `[${new Date().toLocaleTimeString()}] ${randomMsg}`]);
    }, 4000);
    return () => clearInterval(timer);
  }, [isActivated, tierText]);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      
      {/* Upper Layout */}
      <div className="flex flex-1">
        
        {/* Sidebar */}
        <aside 
          data-testid="hub-sidebar"
          className="w-64 border-r border-zinc-800 bg-zinc-900/50 p-6 flex flex-col justify-between"
        >
          <div className="space-y-6">
            <div className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span className="text-[#a855f7] font-extrabold drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">
                B.T AI Labs
              </span>
            </div>
            
            <nav className="space-y-2">
              <Link 
                href="/hub" 
                data-testid="sidebar-link-overview"
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-800 text-white font-medium transition"
              >
                <LayoutDashboard className="h-4 w-4 text-purple-400" />
                Overview
              </Link>
              <Link 
                href="/hub" 
                data-testid="sidebar-link-analytics"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition"
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Link>
              <Link 
                href="/hub" 
                data-testid="sidebar-link-settings"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </nav>
          </div>

          <div className="space-y-4">
            
            {/* AUTO RUN purple button */}
            <button
              onClick={() => {
                if (!isActivated) {
                  alert("Vui lòng kích hoạt tài khoản để sử dụng chức năng AUTO RUN.");
                  return;
                }
                setLogs(prev => [...prev, "[SYSTEM] [AUTO RUN] Đã bắt đầu tiến trình chạy tự động liên tục."]);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold tracking-wider shadow-lg shadow-purple-500/20 active:scale-95 transition"
            >
              <Play className="h-4 w-4 fill-white" />
              TỰ ĐỘNG (AUTO RUN)
            </button>

            <div 
              data-testid="hub-user-profile"
              className="flex items-center gap-3 p-2 rounded-lg bg-zinc-900/80 border border-zinc-800"
            >
              <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                <User className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs text-zinc-400">User Profile</div>
                <div className="text-sm font-semibold text-white">Guest User</div>
              </div>
            </div>

            <Link
              href="/"
              data-testid="hub-logout-btn"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-955/20 transition w-full text-left font-medium"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Link>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-8 overflow-y-auto space-y-8 pb-16">
          <header className="flex justify-between items-center pb-4 border-b border-zinc-800">
            <div>
              <h1 className="text-3xl font-extrabold tracking-wider text-[#a855f7] drop-shadow-[0_0_8px_rgba(168,85,247,0.3)]">
                B.T AI Labs Hub
              </h1>
              <p className="text-zinc-400 text-sm mt-1">Hệ thống giám sát và quét nội dung tự động</p>
            </div>
          </header>

          {/* Stats Grid */}
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div data-testid="stat-banned-content" className="rounded-xl border border-zinc-800 bg-[#1e1e24] p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-zinc-400">Total Banned</p>
                  <h3 className="text-2xl font-bold text-white mt-2">14,204</h3>
                </div>
                <span className="p-2 rounded-lg bg-red-500/10 text-red-500">
                  <Shield className="h-5 w-5" />
                </span>
              </div>
            </div>

            <div data-testid="stat-active-scans" className="rounded-xl border border-zinc-800 bg-[#1e1e24] p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-zinc-400">Active Scans</p>
                  <h3 className="text-2xl font-bold text-white mt-2">42</h3>
                </div>
                <span className="p-2 rounded-lg bg-green-500/10 text-green-500">
                  <Activity className="h-5 w-5" />
                </span>
              </div>
            </div>

            <div data-testid="stat-cpu-usage" className="rounded-xl border border-zinc-800 bg-[#1e1e24] p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-zinc-400">CPU Usage</p>
                  <h3 className="text-2xl font-bold text-white mt-2">12.4%</h3>
                </div>
                <span className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                  <Cpu className="h-5 w-5" />
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-[#1e1e24] p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-zinc-400">Account Tier</p>
                  <h3 data-testid="stat-account-tier" className="text-xl font-bold text-purple-400 mt-2">
                    {tierText}
                  </h3>
                </div>
                <span className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                  <User className="h-5 w-5" />
                </span>
              </div>
            </div>
          </section>

          {/* Controls Panel & Action Buttons (Blue, Green, Orange, Red) */}
          <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">Công cụ điều khiển nhanh</h3>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setLogs(prev => [...prev, "[INFO] Bắt đầu chạy 'Start Sequence'..."])}
                className="px-6 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-white font-semibold shadow-md transition"
              >
                Start Sequence (Blue)
              </button>
              <button
                onClick={() => setLogs(prev => [...prev, "[INFO] Bắt đầu chạy 'Start Assemble'..."])}
                className="px-6 py-2.5 rounded-lg bg-green-500 hover:bg-green-400 text-black font-semibold shadow-md transition"
              >
                Start Assemble (Green)
              </button>
              <button
                onClick={() => setLogs(prev => [...prev, "[INFO] Mở bảng cấu hình nâng cao..."])}
                className="px-6 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-black font-semibold shadow-md transition"
              >
                Configure AI (Orange)
              </button>
              <button
                onClick={() => setLogs(prev => [...prev, "[DANGER] DỪNG KHẨN CẤP TIẾN TRÌNH QUÉT!"])}
                className="px-6 py-2.5 rounded-lg bg-red-500 hover:bg-red-400 text-white font-semibold shadow-md transition"
              >
                STOP RUN (Red)
              </button>
            </div>
          </section>

          {/* Tool Cards (bg-[#1e1e24]) */}
          <section className="space-y-4">
            <h3 className="text-xl font-bold text-white">Danh sách công cụ</h3>
            <div className="grid gap-6 md:grid-cols-2">
              
              {/* Tool Card 1: BanContent All-in-One */}
              <div className="rounded-xl border border-zinc-800 bg-[#1e1e24] p-6 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-white">BanContent All-in-One</h4>
                    <span className="h-8 w-8 rounded-lg bg-zinc-800 flex items-center justify-center text-white font-bold">A</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700">
                      Yêu cầu: Mua Gói VIP
                    </span>
                  </div>
                  <p className="text-zinc-400 text-sm mt-4">
                    Quét và dọn dẹp hàng loạt các bình luận, video rác tự động. Tự cấu hình từ khoá nhạy cảm.
                  </p>
                </div>
                <div>
                  {isActivated ? (
                    <button 
                      onClick={() => setLogs(prev => [...prev, "[SUCCESS] Kích hoạt công cụ BanContent All-in-One thành công."])}
                      className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold transition"
                    >
                      Mở Công Cụ
                    </button>
                  ) : (
                    <button 
                      disabled
                      className="w-full py-2.5 rounded-lg bg-gray-700 text-gray-400 cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
                    >
                      <Lock className="h-4 w-4" />
                      Đã khóa
                    </button>
                  )}
                </div>
              </div>

              {/* Tool Card 2: Healing Video Maker */}
              <div className="rounded-xl border border-zinc-800 bg-[#1e1e24] p-6 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-white">Healing Video Maker</h4>
                    <span className="h-8 w-8 rounded-lg bg-zinc-800 flex items-center justify-center text-white font-bold">H</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700">
                      Yêu cầu: Mua Gói Ultimate
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-950 text-red-400 border border-red-900">
                      Sắp ra mắt (Bản Pro)
                    </span>
                  </div>
                  <p className="text-zinc-400 text-sm mt-4">
                    Tự động tạo video thư giãn, ghép nhạc nhẹ nhàng và xuất bản lên các kênh truyền thông xã hội.
                  </p>
                </div>
                <div>
                  {isUltimate ? (
                    <button 
                      onClick={() => setLogs(prev => [...prev, "[SUCCESS] Kích hoạt công cụ Healing Video Maker thành công."])}
                      className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold transition"
                    >
                      Mở Công Cụ
                    </button>
                  ) : (
                    <button 
                      disabled
                      className="w-full py-2.5 rounded-lg bg-gray-700 text-gray-400 cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
                    >
                      <Lock className="h-4 w-4" />
                      Đã khóa
                    </button>
                  )}
                </div>
              </div>

            </div>
          </section>

          {/* Interactive Checkboxes & Terminal logs */}
          <section className="grid gap-6 md:grid-cols-2">
            
            {/* Checkbox settings card */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-6">
              <h3 className="text-lg font-semibold text-white">Cài đặt tiến trình</h3>
              <div className="space-y-4">
                
                {/* Checkbox 1 */}
                <div 
                  onClick={() => setDeepScan(!deepScan)}
                  className="flex items-center gap-3 cursor-pointer select-none"
                >
                  <span className="text-zinc-400 transition hover:text-white">
                    {deepScan ? (
                      <div className="flex h-5 w-5 items-center justify-center rounded border border-green-500 bg-green-500/10 text-green-500">
                        <span className="text-xs font-bold">✓</span>
                      </div>
                    ) : (
                      <div className="h-5 w-5 rounded border border-zinc-700 bg-transparent" />
                    )}
                  </span>
                  <span className="text-sm font-medium text-zinc-300">Kích hoạt chế độ Quét sâu (Deep Scan)</span>
                </div>

                {/* Checkbox 2 */}
                <div 
                  onClick={() => setAutoClean(!autoClean)}
                  className="flex items-center gap-3 cursor-pointer select-none"
                >
                  <span className="text-zinc-400 transition hover:text-white">
                    {autoClean ? (
                      <div className="flex h-5 w-5 items-center justify-center rounded border border-green-500 bg-green-500/10 text-green-500">
                        <span className="text-xs font-bold">✓</span>
                      </div>
                    ) : (
                      <div className="h-5 w-5 rounded border border-zinc-700 bg-transparent" />
                    )}
                  </span>
                  <span className="text-sm font-medium text-zinc-300">Tự động xoá nhật ký rác sau 24h</span>
                </div>

                {/* Checkbox 3 */}
                <div 
                  onClick={() => setNotifySupport(!notifySupport)}
                  className="flex items-center gap-3 cursor-pointer select-none"
                >
                  <span className="text-zinc-400 transition hover:text-white">
                    {notifySupport ? (
                      <div className="flex h-5 w-5 items-center justify-center rounded border border-green-500 bg-green-500/10 text-green-500">
                        <span className="text-xs font-bold">✓</span>
                      </div>
                    ) : (
                      <div className="h-5 w-5 rounded border border-zinc-700 bg-transparent" />
                    )}
                  </span>
                  <span className="text-sm font-medium text-zinc-300">Thông báo cho quản trị viên khi phát hiện lỗi</span>
                </div>

              </div>
            </div>

            {/* Terminal logs window */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 flex flex-col space-y-3">
              <h3 className="text-lg font-semibold text-white">Nhật ký hệ thống</h3>
              <div className="flex-1 bg-black rounded-lg border border-zinc-800 p-4 font-mono text-xs text-green-400 h-40 overflow-y-auto space-y-1">
                {logs.map((log, index) => (
                  <div key={index}>{log}</div>
                ))}
              </div>
            </div>

          </section>

          {/* Mock Charts */}
          <section 
            data-testid="hub-charts-container" 
            className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 flex flex-col items-center justify-center min-h-[300px]"
          >
            <h3 className="text-lg font-semibold text-white mb-6 w-full text-left">Scan Trends</h3>
            <svg 
              data-testid="hub-chart-graphic" 
              className="w-full max-w-xl h-48"
              viewBox="0 0 100 50"
            >
              <path 
                d="M0 45 Q20 35 40 40 T80 15 T100 10" 
                fill="none" 
                stroke="#a855f7" 
                strokeWidth="2" 
              />
              <path 
                d="M0 45 Q20 40 40 42 T80 25 T100 20" 
                fill="none" 
                stroke="#06b6d4" 
                strokeWidth="2" 
                strokeDasharray="2"
              />
            </svg>
          </section>

        </main>
      </div>

      {/* Footer / Bottom Bar */}
      <footer className="w-full border-t border-zinc-800 bg-zinc-950 p-4 flex items-center justify-between text-xs text-zinc-500 z-10">
        <div className="flex items-center gap-2">
          <Mail className="h-3.5 w-3.5 text-blue-400" />
          <span>Hỗ trợ:</span>
          <a href="mailto:support@bt-ailabs.com" className="text-blue-400 hover:underline">
            support@bt-ailabs.com
          </a>
        </div>
        
        <div>
          <span>Trạng thái: </span>
          <span className="font-semibold text-zinc-300">
            {isActivated ? `Tài khoản: Hoạt động (${tierText})` : "Tài khoản: Khách (Chưa kích hoạt)"}
          </span>
        </div>

        <div>
          <button 
            onClick={() => alert("Chức năng Đăng nhập đang được cập nhật.")}
            className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium transition"
          >
            Đăng Nhập
          </button>
        </div>
      </footer>

    </div>
  );
}

export default function Hub() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 text-zinc-400 flex items-center justify-center">Loading dashboard...</div>}>
      <HubContent />
    </Suspense>
  );
}
```
