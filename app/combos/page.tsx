"use client";

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useStoreProducts } from '@/hooks/useStoreProducts';

export default function CombosPage() {
  const { combos: COMBOS, loading } = useStoreProducts();
  
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-neonPurple/30 relative">
      <Header />
      <main className="pt-24 pb-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="mb-10">
            <Link href="/#combos" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition mb-6">
              <ArrowLeft className="w-4 h-4" /> Quay lại trang chủ
            </Link>

            {/* Flash Sale Banner */}
            <div className="rounded-2xl p-8 bg-gradient-to-br from-pink-600 to-rose-500 text-white relative overflow-hidden shadow-[0_0_30px_rgba(225,29,72,0.3)] mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="absolute -right-10 -top-10 text-9xl opacity-10 pointer-events-none">⚡</div>
              <div className="relative z-10">
                <h3 className="text-3xl font-extrabold mb-2 flex items-center gap-2">
                  <span className="animate-pulse">⚡</span> FLASH DEAL MỖI NGÀY
                </h3>
                <p className="text-pink-100 max-w-2xl text-lg">
                  Sở hữu ngay các bộ combo công cụ tự động hóa tối tân nhất với mức giá giảm lên đến 50%. Cơ hội vàng cho anh em MMO!
                </p>
              </div>
              <div className="relative z-10 shrink-0 bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30 text-center min-w-[200px] shadow-lg">
                 <p className="text-sm font-bold uppercase tracking-wider text-pink-100 mb-1">Kết thúc trong</p>
                 <div className="text-3xl font-black tabular-nums tracking-widest animate-pulse">
                   12:45:30
                 </div>
              </div>
            </div>

            <h1 className="text-4xl font-bold text-white mb-2 uppercase">Tất cả Combo</h1>
            <p className="text-zinc-400">Khám phá các giải pháp toàn diện đã được tối ưu cho từng quy trình</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {COMBOS.map((combo) => {
              const Icon = combo.icon;
              return (
                <div key={combo.id} className={`bg-zinc-950/80 backdrop-blur-md border ${combo.themeClasses.border} rounded-2xl overflow-hidden ${combo.themeClasses.borderHover} transition group flex flex-col shadow-xl`}>
                  {combo.badge && (
                    <div className={`absolute top-0 right-0 ${combo.badgeColor} text-[10px] font-bold px-3 py-1 rounded-bl-lg z-10 shadow-lg`}>{combo.badge}</div>
                  )}
                  <div className="h-48 bg-zinc-900/50 relative overflow-hidden flex items-center justify-center">
                     <div className={`absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] ${combo.themeClasses.gradientFrom} via-transparent to-transparent group-hover:opacity-40 transition`}></div>
                     <Icon className={`w-16 h-16 ${combo.themeClasses.text}/50 group-hover:scale-110 transition duration-500`} />
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className={`text-lg font-bold text-white mb-2 ${combo.themeClasses.textHover} transition`}>{combo.name}</h3>
                    <p className="text-sm text-zinc-400 mb-6 flex-grow">{combo.description}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <div>
                        {combo.originalPriceText && (
                          <p className="text-sm text-zinc-500 line-through">{combo.originalPriceText}</p>
                        )}
                        <p className={`text-xl font-bold ${combo.themeClasses.text}`}>{combo.priceText.split('/')[0]}<span className="text-xs text-zinc-500 font-normal">/{combo.priceText.split('/')[1] || ''}</span></p>
                      </div>
                      <button className={`bg-zinc-800 ${combo.themeClasses.bgHover} ${combo.themeClasses.textHoverWhite ? 'hover:text-white' : 'hover:text-zinc-950'} text-zinc-300 px-4 py-2 rounded-lg text-sm font-bold transition`}>
                        {combo.actionText}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
