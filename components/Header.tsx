"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingCart, Heart, Globe, LogOut } from 'lucide-react';

import { useCart } from '@/app/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { cartItems, setIsCartOpen } = useCart();
  const { user, userData, logout } = useAuth();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#')) {
      if (typeof window !== 'undefined' && window.location.pathname === '/') {
        e.preventDefault();
        const targetId = href.substring(2);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          setIsOpen(false);
          scrollToElastic(targetElement.offsetTop - 80); // Offset for sticky header
        } else {
           window.location.hash = targetId;
        }
      }
    } else {
      // If not an anchor link, just let it navigate but close menu
      setIsOpen(false);
    }
  };

  const scrollToElastic = (targetPosition: number) => {
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 1200; // 1.2s for slow spin feeling
    let start: number | null = null;

    // easeOutBack to create the pulling machine "elastic" effect
    const easeOutBack = (t: number): number => {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    };

    const animation = (currentTime: number) => {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const progress = Math.min(timeElapsed / duration, 1);
      
      const easeProgress = easeOutBack(progress);
      window.scrollTo(0, startPosition + distance * easeProgress);

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  };
  return (
    <header data-testid="header" className="sticky top-0 z-50 w-full flex flex-col">
      {/* Top Banner (Flash Sale) */}
      {pathname === '/' && (
        <div className="bg-red-600 px-4 py-2 text-center text-sm font-medium text-white flex items-center justify-center gap-2">
          <span>🔥 Ưu đãi sốc — hàng trăm tool & workflow đang giảm giá</span>
          <Link href={user ? "/hub?tab=wallet" : "/login?redirect=/hub?tab=wallet"} className="font-bold underline hover:text-red-200 transition">
            Nạp ngay →
          </Link>
        </div>
      )}

      {/* Backdrop overlay */}
      {isOpen && (
        <div
          data-testid="mobile-menu-backdrop"
          className="bg-black/50 backdrop-blur-sm fixed inset-0 z-40 transition-opacity md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Navigation */}
      <div className="w-full border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md relative z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-4 md:px-8">
          
          {/* Brand Logo */}
          <Link href="/" data-testid="brand-logo" className="flex items-center hover:opacity-80 transition shrink-0">
            <img src="/logo.jpeg" alt="Ban Content Logo" className="w-32 md:w-40 h-auto object-contain mix-blend-screen origin-left" />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/" data-testid="nav-link-home" className="text-zinc-300 hover:text-white transition flex items-center gap-1">
              <span>🏠</span> Trang chủ
            </Link>
            <Link href="/#pricing" data-testid="nav-link-pricing" onClick={(e) => handleAnchorClick(e, '/#pricing')} className="text-zinc-300 hover:text-white transition flex items-center gap-1">
              <span>💎</span> Bảng giá
            </Link>
            <Link href="/#tools" data-testid="nav-link-tools" onClick={(e) => handleAnchorClick(e, '/#tools')} className="text-zinc-300 hover:text-white transition flex items-center gap-1">
              <span>🔧</span> Công cụ
            </Link>
            <Link href="/#combos" data-testid="nav-link-combos" onClick={(e) => handleAnchorClick(e, '/#combos')} className="text-zinc-300 hover:text-white transition flex items-center gap-1">
              <span>📦</span> Combo
            </Link>
            <Link href="/#courses" data-testid="nav-link-courses" onClick={(e) => handleAnchorClick(e, '/#courses')} className="text-zinc-300 hover:text-white transition flex items-center gap-1">
              <span>📚</span> Khóa học
            </Link>
            <Link href="/#free" data-testid="nav-link-free" onClick={(e) => handleAnchorClick(e, '/#free')} className="text-zinc-300 hover:text-white transition flex items-center gap-1">
              <span>🎁</span> Miễn Phí
            </Link>
            <Link href="/download" data-testid="nav-link-download" className={`${pathname === '/download' ? 'text-neonPurple active' : 'text-zinc-300'} hover:text-white transition flex items-center gap-1`}>
              <span>📥</span> Download
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-start gap-4">
            <div className="flex flex-col items-end justify-center gap-2">
              {/* Top Row: User / Auth */}
              {user ? (
                <div className="flex items-center gap-4">
                  {(userData?.role === "admin" || userData?.role === "super_admin") && (
                    <Link href="/admin" className="text-sm font-semibold text-zinc-300 hover:text-white transition">
                      Admin Panel
                    </Link>
                  )}
                  <Link href="/hub" className="text-sm font-bold text-white bg-gradient-to-r from-neonPurple to-neonPurple-dark px-4 py-1.5 rounded-lg hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] transition flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-700 text-[10px] font-bold uppercase">
                      {userData?.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                    </div>
                    {userData?.displayName?.split(' ')[0] || "Hub"}
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" className="text-sm font-medium text-zinc-300 hover:text-white px-3 py-1.5">
                    Đăng Nhập
                  </Link>
                  <Link href="/login" className="text-sm font-bold text-white bg-gradient-to-r from-neonPurple to-neonPurple-dark px-4 py-1.5 rounded-lg hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] transition">
                    Đăng Ký
                  </Link>
                </div>
              )}

              {/* Bottom Row: Icons */}
              <div className="flex items-center gap-5">
                <button className="text-zinc-400 hover:text-white transition flex items-center gap-1.5 text-xs font-medium">
                  <Globe className="h-3.5 w-3.5" /> VN
                </button>
                <button className="text-zinc-400 hover:text-red-400 transition">
                  <Heart className="h-4 w-4" />
                </button>
                <button onClick={() => setIsCartOpen(true)} className="text-zinc-400 hover:text-neonGreen transition relative">
                  <ShoppingCart className="h-4 w-4" />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full">
                      {cartItems.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Logout Button outside the column so icons align with User Button */}
            {user && (
              <button onClick={() => logout()} className="text-zinc-500 hover:text-red-400 transition mt-2" title="Đăng xuất">
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Mobile Right Actions & Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button onClick={() => setIsCartOpen(true)} className="text-zinc-400 hover:text-neonGreen transition relative p-2">
              <ShoppingCart className="h-5 w-5" />
              {cartItems.length > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cartItems.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              data-testid="menu-toggle-btn"
              className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <nav
          className={`absolute left-0 right-0 top-full flex flex-col gap-4 border-b border-zinc-800 bg-zinc-950 p-6 shadow-xl md:hidden z-50 transition-all duration-300 ease-in-out ${
            isOpen
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
        >
          <Link href="/" data-testid="nav-link-home" className="text-sm font-medium text-zinc-400 hover:text-white transition flex items-center gap-1" onClick={() => setIsOpen(false)}>
            <span>🏠</span> Trang chủ
          </Link>
          <Link href="/#pricing" data-testid="nav-link-pricing" className="text-sm font-medium text-zinc-400 hover:text-white transition flex items-center gap-1" onClick={(e) => handleAnchorClick(e, '/#pricing')}>
            <span>💎</span> Bảng giá
          </Link>
          <Link href="/#tools" data-testid="nav-link-tools" className="text-sm font-medium text-zinc-400 hover:text-white transition flex items-center gap-1" onClick={(e) => handleAnchorClick(e, '/#tools')}>
            <span>🔧</span> Công cụ
          </Link>
          <Link href="/#combos" data-testid="nav-link-combos" className="text-sm font-medium text-zinc-400 hover:text-white transition flex items-center gap-1" onClick={(e) => handleAnchorClick(e, '/#combos')}>
            <span>📦</span> Combo
          </Link>
          <Link href="/#courses" data-testid="nav-link-courses" className="text-sm font-medium text-zinc-400 hover:text-white transition flex items-center gap-1" onClick={(e) => handleAnchorClick(e, '/#courses')}>
            <span>📚</span> Khóa học
          </Link>
          <Link href="/#free" data-testid="nav-link-free" className="text-sm font-medium text-zinc-400 hover:text-white transition flex items-center gap-1" onClick={(e) => handleAnchorClick(e, '/#free')}>
            <span>🎁</span> Miễn Phí
          </Link>
          <Link href="/download" data-testid="nav-link-download" className={`${pathname === '/download' ? 'text-neonPurple active' : 'text-zinc-300'} text-sm font-medium hover:text-white transition flex items-center gap-1`} onClick={() => setIsOpen(false)}>
            <span>📥</span> Download
          </Link>
          <hr className="border-zinc-800" />
          <div className="flex flex-col gap-3">
            {user ? (
              <>
                <div className="flex items-center justify-between px-2 mb-2">
                  <span className="text-zinc-300 font-medium">Chào, {userData?.displayName || user.email?.split('@')[0]}</span>
                  <span className="text-neonPurple text-sm font-bold">{userData?.walletBalance?.toLocaleString()}đ</span>
                </div>
                {(userData?.role === "admin" || userData?.role === "super_admin") && (
                  <Link href="/admin" className="text-sm font-bold text-center text-zinc-300 hover:text-white py-2 border border-zinc-800 rounded-lg" onClick={() => setIsOpen(false)}>
                    Admin Panel
                  </Link>
                )}
                <Link href="/hub" className="text-sm font-bold text-center text-white bg-neonPurple py-2 rounded-lg" onClick={() => setIsOpen(false)}>Vào Workspace</Link>
                <button onClick={() => logout()} className="text-sm font-medium text-center text-red-400 hover:text-red-300 py-2 border border-red-900/30 rounded-lg">Đăng xuất</button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-center text-zinc-400 hover:text-white transition">Đăng Nhập</Link>
                <Link href="/login" className="text-sm font-bold text-center text-white bg-neonPurple py-2 rounded-lg">Đăng Ký</Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
