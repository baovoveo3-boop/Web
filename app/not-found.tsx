"use client";

import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-x-hidden font-sans">
      <Header />
      
      <main className="flex-grow flex items-center justify-center py-20 relative px-4">
        {/* Background circuit/glow effects */}
        <div className="absolute inset-0 bg-[url('/circuit-bg.jpg')] bg-cover bg-center bg-fixed opacity-10 z-0"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-neonPurple/20 rounded-full blur-3xl z-0"></div>

        <div 
          data-testid="not-found-container" 
          className="relative z-10 max-w-md w-full bg-zinc-950/80 border border-zinc-800 rounded-2xl p-8 text-center backdrop-blur-md shadow-xl"
        >
          <span className="text-6xl mb-4 block">🔍</span>
          <h2 className="text-2xl font-bold text-white mb-2">Không Tìm Thấy Công Cụ</h2>
          <p className="text-zinc-400 mb-6 text-sm">
            Công cụ bạn yêu cầu không tồn tại hoặc đã được chuyển sang địa chỉ khác. Vui lòng kiểm tra lại đường dẫn.
          </p>
          <Link 
            href="/" 
            data-testid="not-found-back-home"
            className="inline-block w-full px-6 py-3 rounded-lg font-bold text-zinc-950 bg-gradient-to-r from-neonGreen to-emerald-400 hover:scale-105 transition transform shadow-[0_0_20px_rgba(34,197,94,0.4)]"
          >
            Quay Lại Trang Chủ
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
