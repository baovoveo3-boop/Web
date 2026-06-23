"use client";

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft, Star } from 'lucide-react';
import { useStoreProducts } from '@/hooks/useStoreProducts';

export default function ToolsPage() {
  const { tools: TOOLS, loading } = useStoreProducts();
  
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-neonPurple/30 relative">
      <Header />
      <main className="pt-24 pb-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="mb-10">
            <Link href="/#tools" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition mb-6">
              <ArrowLeft className="w-4 h-4" /> Quay lại trang chủ
            </Link>
            <h1 className="text-4xl font-bold text-white mb-2 uppercase">Công Cụ AI</h1>
            <p className="text-zinc-400">Khám phá toàn bộ công cụ tự động hóa tối ưu nhất.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <div key={tool.id} className={`bg-zinc-950/80 backdrop-blur-md border ${tool.themeClasses.border} rounded-2xl overflow-hidden ${tool.themeClasses.borderHover} transition group flex flex-col shadow-xl`}>
                  {tool.badge && (
                    <div className={`absolute top-0 right-0 ${tool.badgeColor} text-[10px] font-bold px-3 py-1 rounded-bl-lg z-10 shadow-lg`}>{tool.badge}</div>
                  )}
                  <div className="h-48 bg-zinc-900/50 relative overflow-hidden flex items-center justify-center">
                     <div className={`absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] ${tool.themeClasses.gradientFrom} via-transparent to-transparent group-hover:opacity-40 transition`}></div>
                     <Icon className={`w-16 h-16 ${tool.themeClasses.text}/50 group-hover:scale-110 transition duration-500`} />
                     {tool.rating && (
                       <span className="absolute top-4 left-4 text-[10px] bg-zinc-800/80 text-yellow-500 px-2 py-1 rounded flex items-center gap-1 font-bold">
                         <Star className="w-3 h-3 fill-yellow-500" /> {tool.rating}
                       </span>
                     )}
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className={`text-lg font-bold text-white mb-2 ${tool.themeClasses.textHover} transition`}>{tool.name}</h3>
                    <p className="text-sm text-zinc-400 mb-6 flex-grow">{tool.description}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <div>
                        {tool.originalPriceText && (
                          <p className="text-sm text-zinc-500 line-through">{tool.originalPriceText}</p>
                        )}
                        <p className={`text-xl font-bold ${tool.themeClasses.text}`}>{tool.priceText.split('/')[0]}<span className="text-xs text-zinc-500 font-normal">/{tool.priceText.split('/')[1] || ''}</span></p>
                      </div>
                      <button className={`bg-zinc-800 ${tool.themeClasses.bgHover} ${tool.themeClasses.textHoverWhite ? 'hover:text-white' : 'hover:text-zinc-950'} text-zinc-300 px-4 py-2 rounded-lg text-sm font-bold transition`}>
                        {tool.actionText}
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
