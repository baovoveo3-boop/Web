"use client";

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useStoreProducts } from '@/hooks/useStoreProducts';
import CircuitAnimation from '@/components/CircuitAnimation';

export default function FreePage() {
  const { freeResources: FREE_RESOURCES, loading } = useStoreProducts();
  
  return (
    <div className="min-h-screen bg-[#0B0510] text-zinc-50 font-sans selection:bg-neonPurple/30 relative overflow-hidden">
      {/* Ảnh nền Mạch Điện Não Bộ */}
      <div className="absolute inset-0 bg-[url('/circuit-bg.jpg')] bg-cover bg-center bg-fixed opacity-30 z-0 pointer-events-none"></div>
      
      {/* Hiệu ứng tia điện */}
      <div className="absolute inset-0 z-0 opacity-50 pointer-events-none">
         <CircuitAnimation />
      </div>

      <Header />
      <main className="pt-24 pb-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="mb-10">
            <Link href="/#free" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition mb-6">
              <ArrowLeft className="w-4 h-4" /> Quay lại trang chủ
            </Link>
            <h1 className="text-4xl font-bold text-white mb-2 uppercase">Tài Nguyên Miễn Phí</h1>
            <p className="text-zinc-400">Các phần mềm, E-book và quà tặng hoàn toàn miễn phí dành cho cộng đồng</p>
          </div>

          {FREE_RESOURCES.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {FREE_RESOURCES.map((item) => {
                const Icon = item.icon;
                return (
                  <Link href={`/free/${item.id}`} key={item.id} className={`bg-zinc-950/80 backdrop-blur-md border ${item.themeClasses.border} rounded-2xl overflow-hidden ${item.themeClasses.borderHover} transition group flex flex-col shadow-xl`}>
                    {item.badge && (
                      <div className={`absolute top-0 right-0 ${item.badgeColor} text-[10px] font-bold px-3 py-1 rounded-bl-lg z-10 shadow-lg`}>{item.badge}</div>
                    )}
                    <div className="h-48 bg-zinc-900/50 relative overflow-hidden flex items-center justify-center">
                       <div className={`absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] ${item.themeClasses.gradientFrom} via-transparent to-transparent group-hover:opacity-40 transition`}></div>
                       <Icon className={`w-16 h-16 ${item.themeClasses.text}/50 group-hover:scale-110 transition duration-500`} />
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className={`text-lg font-bold text-white mb-2 ${item.themeClasses.textHover} transition`}>{item.name}</h3>
                      <p className="text-sm text-zinc-400 mb-6 flex-grow">{item.description}</p>
                      <div className="flex items-center justify-between mt-auto">
                        <span className={`w-full text-center bg-zinc-800 ${item.themeClasses.bgHover} ${item.themeClasses.textHoverWhite ? 'hover:text-white' : 'hover:text-zinc-950'} text-zinc-300 px-4 py-2 rounded-lg text-sm font-bold transition`}>
                          {item.actionText}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Coming Soon Placeholders */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-2xl overflow-hidden relative group">
                  <div className="absolute top-0 right-0 bg-zinc-800 text-zinc-400 text-[10px] font-bold px-3 py-1 rounded-bl-lg z-10">SẮP RA MẮT</div>
                  <div className="h-48 bg-zinc-800/30 flex items-center justify-center animate-pulse"></div>
                  <div className="p-6">
                    <div className="h-6 bg-zinc-800 rounded w-2/3 mb-4 animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-zinc-800 rounded w-full animate-pulse"></div>
                      <div className="h-3 bg-zinc-800 rounded w-4/5 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
