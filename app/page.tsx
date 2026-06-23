"use client";

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Settings, Users, Download, Star, CheckCircle, ArrowRight, ChevronLeft, ChevronRight, BookOpen, Play, CheckSquare } from 'lucide-react';

import CircuitAnimation from '@/components/CircuitAnimation';
import ElasticCarousel from '@/components/ElasticCarousel';
import { useStoreProducts } from '@/hooks/useStoreProducts';
import { useCart } from '@/app/context/CartContext';
import CheckoutModal from '@/components/CheckoutModal';
import { ShoppingCart } from 'lucide-react';
import Pricing from '@/components/Pricing';

const DEFAULT_HERO_PRODUCTS = [
  {
    id: "ban-content",
    tag: "🚀 SẢN PHẨM 1",
    titlePrefix: "Ban Content",
    titleHighlight: "Automation",
    description: "Giải pháp hô biến Kịch bản Text hoặc File Excel thành Video hoàn chỉnh chỉ với 1 click. Không cần lộ mặt, không cần phần mềm dựng phim phức tạp!",
    price: "499,000đ",
    originalPrice: "899,000đ",
    image: "/software-box.jpg",
    features: [
      { bold: "Tích hợp All-in-one:", text: "Sinh ảnh AI, nhân bản giọng đọc (TTS) và ghép phụ đề tự động theo từng cảnh." },
      { bold: "Giao diện trực quan:", text: "Quản lý dự án ngay trên GUI hiện đại, dễ dàng theo dõi tiến độ Render." },
      { bold: "Tối ưu năng suất:", text: "Xây dựng hàng loạt kênh tin tức, kể chuyện, review không tốn chi phí Editor." },
    ],
    theme: "from-neonPurple to-neonGreen",
    glow: "bg-neonPurple/20"
  },
  {
    id: "healing-bird",
    tag: "🌿 SẢN PHẨM 2",
    titlePrefix: "Healing Bird",
    titleHighlight: "Tool",
    description: "Hệ thống R&D và Render Kênh Chữa Lành. Tự động quét đối thủ và mix hàng trăm Assets để xuất xưởng những luồng video Healing dài hàng giờ.",
    price: "599,000đ",
    originalPrice: "999,000đ",
    image: "/software-box-2.jpg",
    features: [
      { bold: "R&D Tự Động:", text: "Quét dữ liệu các video chim chóc, thiên nhiên Top 1 thị trường để học hỏi cấu trúc." },
      { bold: "Mix Assets Thông Minh:", text: "Tự động trộn các tệp hình ảnh, âm thanh (Audio Input) và hiệu ứng (SFX) thành Sequence hoàn chỉnh." },
      { bold: "Sinh Tiền Thụ Động:", text: "Xuất video thời lượng dài cực mượt, đáp ứng tiêu chuẩn khắt khe của ngách Relaxation." },
    ],
    theme: "from-emerald-400 to-cyan-400",
    glow: "bg-emerald-400/20"
  }
];

interface ComingSoonProps {
  title: string;
  type: string;
  glowColor: string;
  accentText: string;
  badgeBorder: string;
  badgeBg: string;
  hoverBorder: string;
  hoverShadow: string;
}

function ComingSoonCard({ 
  title, 
  type, 
  glowColor, 
  accentText, 
  badgeBorder, 
  badgeBg,
  hoverBorder,
  hoverShadow
}: ComingSoonProps) {
  return (
    <div 
      data-testid="coming-soon-card"
      className={`relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-md p-6 flex flex-col justify-between group transition-all duration-500 hover:border-zinc-700 ${hoverBorder} ${hoverShadow} h-[320px]`}
    >
      {/* CSS Keyframes for Shimmer & Twinkle effects */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}} />

      {/* Ambient background glow */}
      <div 
        className={`absolute -top-12 -left-12 w-48 h-48 rounded-full blur-[80px] pointer-events-none transition-all duration-700 group-hover:scale-125 opacity-30 group-hover:opacity-50 ${glowColor}`}
      />

      {/* Shimmer glare reflection */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full -skew-x-12 group-hover:animate-[shimmer_2s_infinite] pointer-events-none z-10" />

      {/* Twinkling Stars Overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25 group-hover:opacity-60 transition-opacity duration-500 z-10">
        <div className="absolute top-8 left-12 w-1.5 h-1.5 bg-white rounded-full animate-[twinkle_1.5s_infinite]" />
        <div className="absolute top-24 right-16 w-1 h-1 bg-white rounded-full animate-[twinkle_2.5s_infinite]" />
        <div className="absolute bottom-16 left-24 w-1.5 h-1.5 bg-white rounded-full animate-[twinkle_2s_infinite]" />
      </div>

      <div className="relative z-20">
        {/* Upper Pill Badge */}
        <span 
          data-testid="coming-soon-badge"
          className={`inline-block text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-6 border ${badgeBg} ${accentText} ${badgeBorder}`}
        >
          Sắp ra mắt
        </span>
        
        {/* Placeholder Title */}
        <div className="h-6 w-3/4 bg-zinc-800/50 rounded-md mb-4"></div>
        
        {/* Placeholder Description */}
        <div className="space-y-2">
          <div className="h-3 w-full bg-zinc-800/30 rounded-md"></div>
          <div className="h-3 w-5/6 bg-zinc-800/30 rounded-md"></div>
          <div className="h-3 w-4/6 bg-zinc-800/30 rounded-md"></div>
        </div>
      </div>

      {/* Bottom Footer & Action */}
      <div className="mt-8 flex items-center justify-between border-t border-zinc-800/50 pt-4 z-20">
        <span className="text-xs font-semibold text-zinc-500 italic">Đang phát triển...</span>
        <button 
          disabled
          className="px-4 py-2 rounded-lg text-xs font-bold bg-zinc-850 border border-zinc-800 text-zinc-500 cursor-not-allowed shadow-[0_0_15px_rgba(0,0,0,0.3)]"
        >
          Nhận thông báo
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { addToCart } = useCart();
  const [checkoutItem, setCheckoutItem] = useState<any>(null);
  
  const { combos: COMBOS, tools: TOOLS, courses: COURSES, freeResources: FREE_RESOURCES, allProducts, loading } = useStoreProducts();

  const heroProducts = allProducts
    .filter(p => p.badge?.toUpperCase().includes('HOT') || p.badge?.toUpperCase().includes('BEST SELLER'))
    .slice(0, 5)
    .map((p, index) => {
      const themes = [
        { theme: "from-neonPurple to-neonGreen", glow: "bg-neonPurple/20" },
        { theme: "from-emerald-400 to-cyan-400", glow: "bg-emerald-400/20" },
        { theme: "from-rose-500 to-orange-400", glow: "bg-rose-500/20" },
        { theme: "from-blue-500 to-purple-500", glow: "bg-blue-500/20" },
        { theme: "from-amber-400 to-yellow-600", glow: "bg-amber-400/20" }
      ];
      const t = themes[index % themes.length];
      return {
        id: p.id,
        tag: p.badge?.toUpperCase().includes('BEST SELLER') ? '👑 BEST SELLER' : '🔥 HOT DEALS',
        titlePrefix: p.name,
        titleHighlight: "", 
        description: p.description,
        price: p.priceText,
        originalPrice: p.originalPriceText,
        image: p.image || "/software-box.jpg",
        features: p.features || [],
        theme: t.theme,
        glow: t.glow
      };
    });

  const flashDealProducts = allProducts
    .filter(p => p.badge?.toUpperCase().includes('MỚI') || p.badge?.toUpperCase().includes('FLASH SALE'))
    .slice(0, 3);

  const displayHeroProducts = heroProducts.length > 0 ? heroProducts : DEFAULT_HERO_PRODUCTS;

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % displayHeroProducts.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + displayHeroProducts.length) % displayHeroProducts.length);
  
  const product = displayHeroProducts[currentSlide] || DEFAULT_HERO_PRODUCTS[0];
  
  return (
    <div className="min-h-screen flex flex-col bg-[#0B0510] text-zinc-100 overflow-x-hidden font-sans">
      <Header />
      
      <main className="flex-grow">
        
        {/* WRAPPER XUYÊN SUỐT TOÀN BỘ CÁC BLOCK TRÊN TRANG CHỦ */}
        <div className="relative w-full h-full min-h-screen">
          {/* Ảnh nền Mạch Điện Não Bộ kéo dài */}
          <div className="absolute inset-0 bg-[url('/circuit-bg.jpg')] bg-cover bg-center bg-fixed opacity-40 z-0"></div>
          
          {/* Hiệu ứng tia điện chạy */}
          <div className="absolute inset-0 z-0">
             <CircuitAnimation />
          </div>

          <div className="relative z-10">
            {/* 1. HERO SECTION (Split Layout) */}
            <section className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Cột trái: Khối Highlight siêu lớn (60%) */}
                <div className="lg:col-span-7 relative rounded-2xl overflow-hidden border border-[#3A2266]/50 bg-zinc-900/50 backdrop-blur-sm group shadow-xl">
                  <div className={`absolute inset-0 bg-gradient-to-br ${product.glow} to-transparent z-0 transition-colors duration-500`}></div>
                  
                  <div className="relative z-10 p-6 md:p-10 h-full flex flex-col md:flex-row items-center gap-8">
                    
                    {/* Phần chữ bên trái */}
                    <div className="w-full lg:w-[55%] flex flex-col justify-center relative z-20">
                      <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full w-fit mb-4 uppercase tracking-wider shadow-lg transition-all duration-300">
                        {product.tag}
                      </span>
                      <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2 leading-tight">
                        {product.titlePrefix} <br/>
                        <span className={`text-transparent bg-clip-text bg-gradient-to-r ${product.theme} transition-all duration-500`}>
                          {product.titleHighlight}
                        </span>
                      </h1>
                      <p className="text-zinc-400 mb-6 text-sm md:text-base leading-relaxed max-w-md min-h-[60px]">
                        {product.description}
                      </p>
                      
                      <ul className="space-y-3 mb-8 min-h-[140px] pr-4">
                        {product.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-sm text-zinc-300">
                            <CheckCircle className="w-5 h-5 text-neonGreen flex-shrink-0 mt-0.5" />
                            <span><strong className="text-white">{feature.bold}</strong> {feature.text}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Link 
                          href={`/tools/${product.id}`}
                          data-testid="carousel-view-details"
                          className="w-full sm:w-auto px-8 py-3 rounded-lg font-bold text-zinc-950 bg-gradient-to-r from-neonGreen to-emerald-400 hover:scale-105 transition transform shadow-[0_0_20px_rgba(34,197,94,0.4)] relative z-30 text-center"
                        >
                          Xem Chi Tiết →
                        </Link>
                        <div className="flex flex-col items-center sm:items-start">
                          {product.originalPrice && (
                            <span className="text-sm text-zinc-500 line-through mb-1">{product.originalPrice}</span>
                          )}
                          <span className="text-2xl font-bold text-white relative z-30">{product.price}<span className="text-sm font-normal text-zinc-500">/tháng</span></span>
                        </div>
                      </div>
                    </div>

                    {/* Phần hình ảnh hộp phần mềm bên phải (Showcase Frame) */}
                    <div className="w-full lg:w-[45%] flex justify-center lg:justify-end items-center relative mt-8 lg:mt-0 z-20">
                      
                      {/* Khung kính Glassmorphism */}
                      <div className="relative w-full max-w-[320px] lg:max-w-[340px] aspect-square rounded-2xl overflow-hidden border border-zinc-700/80 bg-[#050505] shadow-[0_0_40px_rgba(168,85,247,0.25)] transition-all duration-500 hover:shadow-[0_0_60px_rgba(168,85,247,0.4)] hover:border-neonPurple/50 group-hover:scale-[1.02]">
                        
                        {/* Lớp Overlay sáng nhẹ chéo góc */}
                        <div className={`absolute inset-0 bg-gradient-to-tr ${product.glow} via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none`}></div>
                        
                        {/* Hình ảnh phần mềm */}
                        <img 
                          key={product.image}
                          src={product.image} 
                          alt={product.titlePrefix} 
                          className="w-full h-full object-cover transform hover:scale-105 transition duration-700 ease-out relative z-0 animate-in fade-in zoom-in duration-500" 
                        />
                      </div>
                    </div>

                    {/* Nút Điều hướng Carousel */}
                    <div className="absolute bottom-6 right-6 flex gap-2 z-30">
                      <button onClick={prevSlide} className="w-10 h-10 rounded-full bg-[#2D1B4E]/80 border border-zinc-700 flex items-center justify-center text-white hover:bg-[#3A2266] hover:border-neonPurple transition backdrop-blur-sm group/btn">
                        <ChevronLeft className="w-5 h-5 group-hover/btn:-translate-x-0.5 transition-transform" />
                      </button>
                      <button onClick={nextSlide} className="w-10 h-10 rounded-full bg-[#2D1B4E]/80 border border-zinc-700 flex items-center justify-center text-white hover:bg-[#3A2266] hover:border-neonPurple transition backdrop-blur-sm group/btn">
                        <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-0.5 transition-transform" />
                      </button>
                    </div>

                  </div>
                </div>

                {/* Cột phải: Flash Deal & Hot Tools (40%) */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                  
                  {/* Khối Flash Deal */}
                  <div className="rounded-2xl p-6 bg-gradient-to-br from-pink-600 to-rose-500 text-white relative overflow-hidden shadow-[0_0_30px_rgba(225,29,72,0.3)]">
                    <div className="absolute -right-10 -top-10 text-9xl opacity-10">⚡</div>
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                      <span>⚡</span> FLASH DEAL
                    </h3>
                    <p className="text-sm text-pink-100 mb-6">
                      Các công cụ AI và tự động hóa chất lượng cao giúp tối ưu hóa quy trình làm việc của bạn trong hôm nay.
                    </p>
                    <Link href="/combos" className="inline-block bg-white text-rose-600 font-bold px-6 py-2 rounded-lg text-sm hover:bg-zinc-100 transition shadow-lg hover:scale-105">
                      Khám Phá Combo & Deal →
                    </Link>
                  </div>

                  {/* Danh sách Tool Bán Chạy / Mới */}
                  <div className="flex flex-col gap-4">
                    {flashDealProducts.length > 0 ? flashDealProducts.map((p, index) => (
                      <Link 
                        key={p.id}
                        href={`/tools/${p.id}`}
                        data-testid={`hot-tool-${p.id}`}
                        className={`flex items-center gap-4 p-4 rounded-xl border border-zinc-700/50 bg-zinc-900/50 backdrop-blur-sm transition group shadow-lg ${p.themeClasses?.borderHover || 'hover:border-neonPurple'}`}
                      >
                        <div className="w-20 h-20 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                          <img src={p.image || "/software-box.jpg"} alt={p.name} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] bg-zinc-800 text-yellow-500 px-2 py-0.5 rounded flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-500" /> {p.rating || "5.0"}</span>
                            {p.badge && (
                              <span className={`text-[10px] px-2 py-0.5 rounded border ${p.badgeColor}`}>{p.badge}</span>
                            )}
                          </div>
                          <h4 className="font-bold text-white text-sm line-clamp-1">{p.name}</h4>
                          <p className={`font-bold mt-1 ${p.themeClasses?.text || 'text-neonPurple'}`}>
                            {p.originalPriceText && <span className="text-xs text-zinc-500 line-through mr-2 font-normal">{p.originalPriceText}</span>}
                            {p.priceText}<span className="text-xs text-zinc-500 font-normal">/tháng</span>
                          </p>
                        </div>
                      </Link>
                    )) : (
                      <div className="text-center text-zinc-500 text-sm py-8 border border-dashed border-zinc-800 rounded-xl">
                        Chưa có sản phẩm MỚI / FLASH SALE nào
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </section>

            {/* 2. CATEGORY PILLS (Nền đen trong suốt để thấy mạch điện bên dưới) */}
            <section className="border-y border-[#3A2266]/50/50 bg-[#0B0510]/50 backdrop-blur-md py-4 shadow-lg">
              <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex flex-nowrap overflow-x-auto gap-3 pb-2 md:pb-0 hide-scrollbar justify-start md:justify-center">
                  <button className="px-5 py-2 rounded-full bg-neonPurple text-white text-sm font-medium whitespace-nowrap">Tất cả Tool</button>
                  <button className="px-5 py-2 rounded-full bg-[#3A2266]/80 text-zinc-300 hover:bg-zinc-700 hover:text-white transition text-sm font-medium whitespace-nowrap">AI Tools</button>
                  <button className="px-5 py-2 rounded-full bg-[#3A2266]/80 text-zinc-300 hover:bg-zinc-700 hover:text-white transition text-sm font-medium whitespace-nowrap">Automation</button>
                  <button className="px-5 py-2 rounded-full bg-[#3A2266]/80 text-zinc-300 hover:bg-zinc-700 hover:text-white transition text-sm font-medium whitespace-nowrap">Marketing</button>
                  <button className="px-5 py-2 rounded-full bg-[#3A2266]/80 text-zinc-300 hover:bg-zinc-700 hover:text-white transition text-sm font-medium whitespace-nowrap">SEO</button>
                  <button className="px-5 py-2 rounded-full bg-[#3A2266]/80 text-zinc-300 hover:bg-zinc-700 hover:text-white transition text-sm font-medium whitespace-nowrap">Social Media</button>
                </div>
              </div>
            </section>

            {/* 3. TRUST INDICATORS (Nền đen trong suốt) */}
            <section className="py-12 bg-[#0B0510]/50 backdrop-blur-md border-b border-[#3A2266]/50/50">
              <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-zinc-800/50">
                  <div className="flex flex-col items-center text-center px-4">
                    <div className="w-12 h-12 rounded-full bg-neonPurple/20 text-neonPurple flex items-center justify-center mb-4 backdrop-blur-md">
                      <Settings className="w-6 h-6" />
                    </div>
                    <h3 className="text-3xl font-extrabold text-white mb-1 drop-shadow-md">15</h3>
                    <p className="text-sm text-zinc-400 font-medium uppercase tracking-wider">Công cụ</p>
                  </div>
                  <div className="flex flex-col items-center text-center px-4">
                    <div className="w-12 h-12 rounded-full bg-neonGreen/20 text-neonGreen flex items-center justify-center mb-4 backdrop-blur-md">
                      <Users className="w-6 h-6" />
                    </div>
                    <h3 className="text-3xl font-extrabold text-white mb-1 drop-shadow-md">2,840</h3>
                    <p className="text-sm text-zinc-400 font-medium uppercase tracking-wider">Người dùng</p>
                  </div>
                  <div className="flex flex-col items-center text-center px-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center mb-4 backdrop-blur-md">
                      <Download className="w-6 h-6" />
                    </div>
                    <h3 className="text-3xl font-extrabold text-white mb-1 drop-shadow-md">15K+</h3>
                    <p className="text-sm text-zinc-400 font-medium uppercase tracking-wider">Lượt tải</p>
                  </div>
                  <div className="flex flex-col items-center text-center px-4">
                    <div className="w-12 h-12 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center mb-4 backdrop-blur-md">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-3xl font-extrabold text-white mb-1 drop-shadow-md">98%</h3>
                    <p className="text-sm text-zinc-400 font-medium uppercase tracking-wider">Thành công</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 3.5 COMBO GRIDS */}
            <section className="py-16 bg-transparent border-b border-[#3A2266]/50/50" id="combos">
              <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex items-end justify-between mb-10">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2 uppercase">Combo Siêu Hời</h2>
                    <p className="text-zinc-400">Giải pháp toàn diện với mức giá ưu đãi nhất cho anh em MMO</p>
                  </div>
                  <Link href="/combos" className="hidden md:flex items-center gap-2 text-neonPurple hover:text-white transition">
                    Xem tất cả <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {loading ? (
                  <div className="flex h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-neonPurple"></div>
                  </div>
                ) : COMBOS.length > 0 ? (
                  <div className={
                    COMBOS.length > 5 
                      ? "flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 hide-scrollbar" 
                      : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  }>
                  {COMBOS.slice(0, 5).map((combo) => {
                    const Icon = combo.icon;
                    return (
                      <div key={combo.id} className={`bg-zinc-900/50 backdrop-blur-md border ${combo.themeClasses.border} rounded-2xl overflow-hidden ${combo.themeClasses.borderHover} transition group flex flex-col shadow-xl ${COMBOS.length > 5 ? 'min-w-[calc(100%-2rem)] md:min-w-[calc(50%-1rem)] lg:min-w-[calc(33.333%-1rem)] snap-start shrink-0' : ''}`}>
                        {combo.badge && (
                          <div className={`absolute top-0 right-0 ${combo.badgeColor} text-[10px] font-bold px-3 py-1 rounded-bl-lg z-10 shadow-lg`}>{combo.badge}</div>
                        )}
                        <Link href={`/combos/${combo.id}`} className="flex flex-col flex-grow cursor-pointer">
<div className="h-56 bg-gradient-to-br from-[#5A3399]/40 to-transparent relative overflow-hidden flex items-center justify-center">
                           <div className={`absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] ${combo.themeClasses.gradientFrom} via-transparent to-transparent group-hover:opacity-60 transition z-0`}></div>
                           <div className="relative w-40 h-40 aspect-square rounded-xl overflow-hidden border border-zinc-700/80 bg-[#050505] shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all duration-500 group-hover:scale-[1.05] z-10">
                             <div className={`absolute inset-0 bg-gradient-to-tr ${combo.themeClasses.gradientFrom} via-transparent to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500 z-10 pointer-events-none`}></div>
                             <img src={combo.image} alt={combo.name} className="w-full h-full object-cover transition duration-700 ease-out" />
                           </div>
                        </div>
                        <div className="p-6 flex flex-col flex-grow pb-0">
                          <h3 className={`text-lg font-bold text-white mb-2 ${combo.themeClasses.textHover} transition`}>{combo.name}</h3>
                          <p className="text-sm text-zinc-400 mb-6 flex-grow">{combo.description}</p>
                          
</div>
</Link>
<div className="w-full">
<div className="flex items-center justify-between mt-auto px-6 pb-6">
                            <div>
                              {combo.originalPriceText && (
                                <p className="text-sm text-zinc-500 line-through">{combo.originalPriceText}</p>
                              )}
                              <p className={`text-xl font-bold ${combo.themeClasses.text}`}>{combo.priceText.split('/')[0]}<span className="text-xs text-zinc-500 font-normal">/{combo.priceText.split('/')[1] || ''}</span></p>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCheckoutItem(combo); }}
                                className={`flex-1 bg-[#3A2266] ${combo.themeClasses.bgHover} ${combo.themeClasses.textHoverWhite ? 'hover:text-white' : 'hover:text-zinc-950'} text-zinc-300 px-4 py-2 rounded-lg text-sm font-bold transition`}
                              >
                                {combo.actionText}
                              </button>
                              <button 
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(combo); alert('Đã thêm vào giỏ hàng!'); }}
                                className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-white hover:border-white/50 transition`}
                                title="Thêm vào giỏ"
                              >
                                <ShoppingCart className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ComingSoonCard 
                      title="Combo Doanh Nhân" 
                      type="tự động hóa toàn diện" 
                      glowColor="bg-neonPurple/20" 
                      accentText="text-neonPurple" 
                      badgeBorder="border-neonPurple/20" 
                      badgeBg="bg-neonPurple/10" 
                      hoverBorder="group-hover:border-neonPurple/50"
                      hoverShadow="group-hover:shadow-[0_0_40px_rgba(168,85,247,0.25)]"
                    />
                    <ComingSoonCard 
                      title="Combo Sáng Tạo" 
                      type="công cụ thiết kế và video" 
                      glowColor="bg-neonGreen/20" 
                      accentText="text-neonGreen" 
                      badgeBorder="border-neonGreen/20" 
                      badgeBg="bg-neonGreen/10" 
                      hoverBorder="group-hover:border-neonGreen/50"
                      hoverShadow="group-hover:shadow-[0_0_40px_rgba(34,197,94,0.25)]"
                    />
                    <ComingSoonCard 
                      title="Combo Starter" 
                      type="bộ công cụ cơ bản cho MMO" 
                      glowColor="bg-blue-500/20" 
                      accentText="text-blue-500" 
                      badgeBorder="border-blue-500/20" 
                      badgeBg="bg-blue-500/10" 
                      hoverBorder="group-hover:border-blue-500/50"
                      hoverShadow="group-hover:shadow-[0_0_40px_rgba(59,130,246,0.25)]"
                    />
                  </div>
                )}
              </div>
            </section>

            {/* 4. PRODUCT GRIDS (Cũng nằm trong Background Xuyên Suốt, Nền đen trong suốt) */}
            <section className="py-16 bg-transparent" id="tools">
              <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex items-end justify-between mb-10">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">AUTOMATION CHUYÊN NGHIỆP</h2>
                    <p className="text-zinc-400">Top các tool tự động hóa đang bán chạy nhất</p>
                  </div>
                  <Link href="/tools" className="hidden md:flex items-center gap-2 text-neonPurple hover:text-white transition">
                    Xem tất cả <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {loading ? (
                  <div className="flex h-64 items-center justify-center" data-testid="tools-loading">
                    <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-neonPurple"></div>
                  </div>
                ) : TOOLS.length > 0 ? (
                  TOOLS.length > 5 ? (
                    <ElasticCarousel>
                      {TOOLS.slice(0, 5).map((tool) => {
                        const Icon = tool.icon;
                        return (
                          <div key={tool.id} className={`bg-zinc-900/50 backdrop-blur-md border ${tool.themeClasses.border} rounded-2xl overflow-hidden ${tool.themeClasses.borderHover} transition group flex flex-col shadow-xl min-w-[calc(100%-2rem)] md:min-w-[calc(50%-1rem)] lg:min-w-[calc(33.333%-1rem)] snap-start shrink-0`}>
                            {tool.badge && (
                              <div className={`absolute top-0 right-0 ${tool.badgeColor} text-[10px] font-bold px-3 py-1 rounded-bl-lg z-10 shadow-lg`}>{tool.badge}</div>
                            )}
                            <Link href={`/tools/${tool.id}`} className="flex flex-col flex-grow cursor-pointer">
  <div className="h-56 bg-gradient-to-br from-[#5A3399]/40 to-transparent relative overflow-hidden flex items-center justify-center">
                               <div className={`absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] ${tool.themeClasses.gradientFrom} via-transparent to-transparent group-hover:opacity-60 transition z-0`}></div>
                               <div className="relative w-40 h-40 aspect-square rounded-xl overflow-hidden border border-zinc-700/80 bg-[#050505] shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all duration-500 group-hover:scale-[1.05] z-10">
                                 <div className={`absolute inset-0 bg-gradient-to-tr ${tool.themeClasses.gradientFrom} via-transparent to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500 z-10 pointer-events-none`}></div>
                                 <img src={tool.image} alt={tool.name} className="w-full h-full object-cover transition duration-700 ease-out" />
                               </div>
                               {tool.rating && (
                                 <span className="absolute top-4 left-4 text-[10px] bg-[#3A2266]/80 text-yellow-500 px-2 py-1 rounded flex items-center gap-1 font-bold">
                                   <Star className="w-3 h-3 fill-yellow-500" /> {tool.rating}
                                 </span>
                               )}
                            </div>
                            <div className="p-6 flex flex-col flex-grow pb-0">
                              <h3 className={`text-lg font-bold text-white mb-2 ${tool.themeClasses.textHover} transition`}>{tool.name}</h3>
                              <p className="text-sm text-zinc-400 mb-6 flex-grow">{tool.description}</p>
                              
  </div>
  </Link>
  <div className="w-full">
  <div className="flex items-center justify-between mt-auto px-6 pb-6">
                                <div>
                                  {tool.originalPriceText && (
                                    <p className="text-sm text-zinc-500 line-through">{tool.originalPriceText}</p>
                                  )}
                                  <p className={`text-xl font-bold ${tool.themeClasses.text}`}>{tool.priceText.split('/')[0]}<span className="text-xs text-zinc-500 font-normal">/{tool.priceText.split('/')[1] || ''}</span></p>
                                </div>
                                <div className="flex gap-2">
                                <button 
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCheckoutItem(tool); }}
                                  className={`flex-1 bg-[#3A2266] ${tool.themeClasses.bgHover} ${tool.themeClasses.textHoverWhite ? 'hover:text-white' : 'hover:text-zinc-950'} text-zinc-300 px-4 py-2 rounded-lg text-sm font-bold transition`}
                                >
                                  {tool.actionText}
                                </button>
                                <button 
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(tool); alert('Đã thêm vào giỏ hàng!'); }}
                                  className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-white hover:border-white/50 transition`}
                                  title="Thêm vào giỏ"
                                >
                                  <ShoppingCart className="w-4 h-4" />
                                </button>
                              </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {/* Thẻ Xem Tất Cả cuối băng chuyền */}
                      <div className="bg-zinc-900/50 backdrop-blur-md border border-[#3A2266]/50 rounded-2xl overflow-hidden hover:border-zinc-700 transition group flex flex-col shadow-xl min-w-[calc(100%-2rem)] md:min-w-[calc(50%-1rem)] lg:min-w-[calc(33.333%-1rem)] snap-start shrink-0 items-center justify-center p-8 relative">
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neonPurple via-transparent to-transparent group-hover:opacity-30 transition"></div>
                        <div className="w-20 h-20 rounded-full bg-[#2D1B4E] border border-[#3A2266]/50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-neonPurple transition duration-500 relative z-10 shadow-lg">
                          <ArrowRight className="w-10 h-10 text-zinc-500 group-hover:text-neonPurple transition" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2 text-center relative z-10">Khám Phá Thêm</h3>
                        <p className="text-sm text-zinc-400 text-center mb-8 relative z-10">Xem toàn bộ {TOOLS.length} công cụ tự động hóa</p>
                        <Link href="/tools" className="bg-neonPurple hover:bg-neonPurple-dark text-white px-6 py-3 rounded-lg text-sm font-bold transition w-full text-center shadow-[0_0_15px_rgba(168,85,247,0.3)] relative z-10">
                          Vào Kho Công Cụ ➔
                        </Link>
                      </div>
                    </ElasticCarousel>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {TOOLS.map((tool) => {
                        const Icon = tool.icon;
                        return (
                          <div key={tool.id} className={`bg-zinc-900/50 backdrop-blur-md border ${tool.themeClasses.border} rounded-2xl overflow-hidden ${tool.themeClasses.borderHover} transition group flex flex-col shadow-xl`}>
                            {tool.badge && (
                              <div className={`absolute top-0 right-0 ${tool.badgeColor} text-[10px] font-bold px-3 py-1 rounded-bl-lg z-10 shadow-lg`}>{tool.badge}</div>
                            )}
                            <Link href={`/tools/${tool.id}`} className="flex flex-col flex-grow cursor-pointer">
  <div className="h-56 bg-gradient-to-br from-[#5A3399]/40 to-transparent relative overflow-hidden flex items-center justify-center">
                               <div className={`absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] ${tool.themeClasses.gradientFrom} via-transparent to-transparent group-hover:opacity-60 transition z-0`}></div>
                               <div className="relative w-40 h-40 aspect-square rounded-xl overflow-hidden border border-zinc-700/80 bg-[#050505] shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all duration-500 group-hover:scale-[1.05] z-10">
                                 <div className={`absolute inset-0 bg-gradient-to-tr ${tool.themeClasses.gradientFrom} via-transparent to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500 z-10 pointer-events-none`}></div>
                                 <img src={tool.image} alt={tool.name} className="w-full h-full object-cover transition duration-700 ease-out" />
                               </div>
                               {tool.rating && (
                                 <span className="absolute top-4 left-4 text-[10px] bg-[#3A2266]/80 text-yellow-500 px-2 py-1 rounded flex items-center gap-1 font-bold">
                                   <Star className="w-3 h-3 fill-yellow-500" /> {tool.rating}
                                 </span>
                               )}
                            </div>
                            <div className="p-6 flex flex-col flex-grow pb-0">
                              <h3 className={`text-lg font-bold text-white mb-2 ${tool.themeClasses.textHover} transition`}>{tool.name}</h3>
                              <p className="text-sm text-zinc-400 mb-6 flex-grow">{tool.description}</p>
                              
  </div>
  </Link>
  <div className="w-full">
  <div className="flex items-center justify-between mt-auto px-6 pb-6">
                                <div>
                                  {tool.originalPriceText && (
                                    <p className="text-sm text-zinc-500 line-through">{tool.originalPriceText}</p>
                                  )}
                                  <p className={`text-xl font-bold ${tool.themeClasses.text}`}>{tool.priceText.split('/')[0]}<span className="text-xs text-zinc-500 font-normal">/{tool.priceText.split('/')[1] || ''}</span></p>
                                </div>
                                <div className="flex gap-2">
                                <button 
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCheckoutItem(tool); }}
                                  className={`flex-1 bg-[#3A2266] ${tool.themeClasses.bgHover} ${tool.themeClasses.textHoverWhite ? 'hover:text-white' : 'hover:text-zinc-950'} text-zinc-300 px-4 py-2 rounded-lg text-sm font-bold transition`}
                                >
                                  {tool.actionText}
                                </button>
                                <button 
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(tool); alert('Đã thêm vào giỏ hàng!'); }}
                                  className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-white hover:border-white/50 transition`}
                                  title="Thêm vào giỏ"
                                >
                                  <ShoppingCart className="w-4 h-4" />
                                </button>
                              </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="coming-soon-grid">
                    <ComingSoonCard 
                      title="Video Script Automation" 
                      type="tự động hóa video kịch bản" 
                      glowColor="bg-neonPurple/20" 
                      accentText="text-neonPurple" 
                      badgeBorder="border-neonPurple/20" 
                      badgeBg="bg-neonPurple/10" 
                      hoverBorder="group-hover:border-neonPurple/50"
                      hoverShadow="group-hover:shadow-[0_0_40px_rgba(168,85,247,0.25)]"
                    />
                    <ComingSoonCard 
                      title="Social Accounts Manager" 
                      type="quản lý tài khoản mạng xã hội" 
                      glowColor="bg-neonGreen/20" 
                      accentText="text-neonGreen" 
                      badgeBorder="border-neonGreen/20" 
                      badgeBg="bg-neonGreen/10" 
                      hoverBorder="group-hover:border-neonGreen/50"
                      hoverShadow="group-hover:shadow-[0_0_40px_rgba(34,197,94,0.25)]"
                    />
                    <ComingSoonCard 
                      title="AI Voice Clone Engine" 
                      type="nhân bản giọng nói AI" 
                      glowColor="bg-blue-500/20" 
                      accentText="text-blue-500" 
                      badgeBorder="border-blue-500/20" 
                      badgeBg="bg-blue-500/10" 
                      hoverBorder="group-hover:border-blue-500/50"
                      hoverShadow="group-hover:shadow-[0_0_40px_rgba(59,130,246,0.25)]"
                    />
                  </div>
                )}
              </div>
            </section>
            {/* 5. COURSES GRIDS */}
            <section className="py-16 bg-transparent border-t border-[#3A2266]/50/50" id="courses">
              <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex items-end justify-between mb-10">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2 uppercase">Khóa Học Thực Chiến</h2>
                    <p className="text-zinc-400">Làm chủ công nghệ - Tối ưu hóa quy trình kiếm tiền MMO</p>
                  </div>
                  <Link href="/courses" className="hidden md:flex items-center gap-2 text-blue-400 hover:text-white transition">
                    Xem tất cả <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {loading ? (
                  <div className="flex h-64 items-center justify-center" data-testid="courses-loading">
                    <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : COURSES.length > 0 ? (
                  <div className={
                    COURSES.length > 5 
                      ? "flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 hide-scrollbar" 
                      : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  }>
                    {COURSES.slice(0, 5).map((course) => {
                      const Icon = course.icon;
                      return (
                        <div key={course.id} className={`bg-zinc-900/50 backdrop-blur-md border ${course.themeClasses.border} rounded-2xl overflow-hidden ${course.themeClasses.borderHover} transition group flex flex-col shadow-xl ${COURSES.length > 5 ? 'min-w-[calc(100%-2rem)] md:min-w-[calc(50%-1rem)] lg:min-w-[calc(33.333%-1rem)] snap-start shrink-0' : ''}`}>
                          {course.badge && (
                            <div className={`absolute top-0 right-0 ${course.badgeColor} text-[10px] font-bold px-3 py-1 rounded-bl-lg z-10 shadow-lg`}>{course.badge}</div>
                          )}
                          <Link href={`/courses/${course.id}`} className="flex flex-col flex-grow cursor-pointer">
  <div className="h-56 bg-gradient-to-br from-[#5A3399]/40 to-transparent relative overflow-hidden flex items-center justify-center">
                             <div className={`absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] ${course.themeClasses.gradientFrom} via-transparent to-transparent group-hover:opacity-60 transition z-0`}></div>
                             <div className="relative w-40 h-40 aspect-square rounded-xl overflow-hidden border border-zinc-700/80 bg-[#050505] shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all duration-500 group-hover:scale-[1.05] z-10">
                               <div className={`absolute inset-0 bg-gradient-to-tr ${course.themeClasses.gradientFrom} via-transparent to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500 z-10 pointer-events-none`}></div>
                               <img src={course.image} alt={course.name} className="w-full h-full object-cover transition duration-700 ease-out" />
                             </div>
                          </div>
                          <div className="p-6 flex flex-col flex-grow pb-0">
                            <h3 className={`text-lg font-bold text-white mb-2 ${course.themeClasses.textHover} transition`}>{course.name}</h3>
                            <p className="text-sm text-zinc-400 mb-6 flex-grow">{course.description}</p>
                            
  </div>
  </Link>
  <div className="w-full">
  <div className="flex items-center justify-between mt-auto px-6 pb-6">
                              <div>
                                {course.originalPriceText && (
                                  <p className="text-sm text-zinc-500 line-through">{course.originalPriceText}</p>
                                )}
                                <p className={`text-xl font-bold ${course.themeClasses.text}`}>{course.priceText.split('/')[0]}<span className="text-xs text-zinc-500 font-normal">/{course.priceText.split('/')[1] || ''}</span></p>
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCheckoutItem(course); }}
                                  className={`flex-1 bg-[#3A2266] ${course.themeClasses.bgHover} ${course.themeClasses.textHoverWhite ? 'hover:text-white' : 'hover:text-zinc-950'} text-zinc-300 px-4 py-2 rounded-lg text-sm font-bold transition`}
                                >
                                  {course.actionText}
                                </button>
                                <button 
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(course); alert('Đã thêm vào giỏ hàng!'); }}
                                  className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-white hover:border-white/50 transition`}
                                  title="Thêm vào giỏ"
                                >
                                  <ShoppingCart className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="coming-soon-grid">
                    <ComingSoonCard 
                      title="YouTube Automation Masterclass" 
                      type="khóa học làm YouTube AI" 
                      glowColor="bg-red-500/20" 
                      accentText="text-red-400" 
                      badgeBorder="border-red-500/20" 
                      badgeBg="bg-red-500/10" 
                      hoverBorder="group-hover:border-red-500/50"
                      hoverShadow="group-hover:shadow-[0_0_40px_rgba(239,68,68,0.25)]"
                    />
                    <ComingSoonCard 
                      title="TikTok Affiliate Blueprint" 
                      type="khóa học tiếp thị liên kết" 
                      glowColor="bg-rose-500/20" 
                      accentText="text-rose-400" 
                      badgeBorder="border-rose-500/20" 
                      badgeBg="bg-rose-500/10" 
                      hoverBorder="group-hover:border-rose-500/50"
                      hoverShadow="group-hover:shadow-[0_0_40px_rgba(244,63,94,0.25)]"
                    />
                    <ComingSoonCard 
                      title="Automation Workflows n8n" 
                      type="khóa học tự động hóa n8n" 
                      glowColor="bg-yellow-500/20" 
                      accentText="text-yellow-400" 
                      badgeBorder="border-yellow-500/20" 
                      badgeBg="bg-yellow-500/10" 
                      hoverBorder="group-hover:border-yellow-500/50"
                      hoverShadow="group-hover:shadow-[0_0_40px_rgba(234,179,8,0.25)]"
                    />
                  </div>
                )}
              </div>
            </section>

            {/* 5.5 BẢNG GIÁ */}
            <Pricing />

            {/* 6. FREE RESOURCES */}
            <section className="py-16 bg-transparent border-t border-[#3A2266]/50/50" id="free">
              <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex items-end justify-between mb-10">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2 uppercase">Tài Nguyên Miễn Phí</h2>
                    <p className="text-zinc-400">Các phần mềm, E-book và quà tặng hoàn toàn miễn phí dành cho cộng đồng</p>
                  </div>
                  <Link href="/free" className="hidden md:flex items-center gap-2 text-rose-400 hover:text-white transition">
                    Khám phá thêm <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {loading ? (
                  <div className="flex h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-neonPurple"></div>
                  </div>
                ) : FREE_RESOURCES.length > 0 ? (
                  <div className={
                    FREE_RESOURCES.length > 5 
                      ? "flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 hide-scrollbar" 
                      : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  }>
                  {FREE_RESOURCES.slice(0, 5).map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.id} className={`bg-zinc-900/50 backdrop-blur-md border ${item.themeClasses.border} rounded-2xl overflow-hidden ${item.themeClasses.borderHover} transition group flex flex-col shadow-xl ${FREE_RESOURCES.length > 5 ? 'min-w-[calc(100%-2rem)] md:min-w-[calc(50%-1rem)] lg:min-w-[calc(33.333%-1rem)] snap-start shrink-0' : ''}`}>
                        {item.badge && (
                          <div className={`absolute top-0 right-0 ${item.badgeColor} text-[10px] font-bold px-3 py-1 rounded-bl-lg z-10 shadow-lg`}>{item.badge}</div>
                        )}
                        <Link href={`/free/${item.id}`} className="flex flex-col flex-grow cursor-pointer">
<div className="h-56 bg-gradient-to-br from-[#5A3399]/40 to-transparent relative overflow-hidden flex items-center justify-center">
                           <div className={`absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] ${item.themeClasses.gradientFrom} via-transparent to-transparent group-hover:opacity-60 transition z-0`}></div>
                           <div className="relative w-40 h-40 aspect-square rounded-xl overflow-hidden border border-zinc-700/80 bg-[#050505] shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all duration-500 group-hover:scale-[1.05] z-10">
                             <div className={`absolute inset-0 bg-gradient-to-tr ${item.themeClasses.gradientFrom} via-transparent to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500 z-10 pointer-events-none`}></div>
                             <img src={item.image} alt={item.name} className="w-full h-full object-cover transition duration-700 ease-out" />
                           </div>
                        </div>
                        <div className="p-6 flex flex-col flex-grow pb-0">
                          <h3 className={`text-lg font-bold text-white mb-2 ${item.themeClasses.textHover} transition`}>{item.name}</h3>
                          <p className="text-sm text-zinc-400 mb-6 flex-grow">{item.description}</p>
                          
</div>
</Link>
<div className="w-full">
<div className="flex items-center justify-between mt-auto px-6 pb-6">
                            <div className="flex gap-2 w-full mt-auto">
                              <button 
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCheckoutItem(item); }}
                                className={`flex-1 bg-[#3A2266] ${item.themeClasses.bgHover} ${item.themeClasses.textHoverWhite ? 'hover:text-white' : 'hover:text-zinc-950'} text-zinc-300 px-4 py-2 rounded-lg text-sm font-bold transition`}
                              >
                                {item.actionText}
                              </button>
                              <button 
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(item); alert('Đã thêm vào giỏ hàng!'); }}
                                className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-white hover:border-white/50 transition`}
                                title="Thêm vào giỏ"
                              >
                                <ShoppingCart className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ComingSoonCard 
                      title="Ebook TikTok Triệu View" 
                      type="tài liệu chiến lược TikTok" 
                      glowColor="bg-neonPurple/20" 
                      accentText="text-neonPurple" 
                      badgeBorder="border-neonPurple/20" 
                      badgeBg="bg-neonPurple/10" 
                      hoverBorder="group-hover:border-neonPurple/50"
                      hoverShadow="group-hover:shadow-[0_0_40px_rgba(168,85,247,0.25)]"
                    />
                    <ComingSoonCard 
                      title="Prompt AI Tối Ưu" 
                      type="bộ lệnh prompt ChatGPT" 
                      glowColor="bg-neonGreen/20" 
                      accentText="text-neonGreen" 
                      badgeBorder="border-neonGreen/20" 
                      badgeBg="bg-neonGreen/10" 
                      hoverBorder="group-hover:border-neonGreen/50"
                      hoverShadow="group-hover:shadow-[0_0_40px_rgba(34,197,94,0.25)]"
                    />
                    <ComingSoonCard 
                      title="Bộ Âm Thanh Bản Quyền" 
                      type="tài nguyên âm thanh video" 
                      glowColor="bg-blue-500/20" 
                      accentText="text-blue-500" 
                      badgeBorder="border-blue-500/20" 
                      badgeBg="bg-blue-500/10" 
                      hoverBorder="group-hover:border-blue-500/50"
                      hoverShadow="group-hover:shadow-[0_0_40px_rgba(59,130,246,0.25)]"
                    />
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Checkout Modal for Direct Buy */}
        <CheckoutModal 
          isOpen={!!checkoutItem} 
          onClose={() => setCheckoutItem(null)} 
          items={checkoutItem ? [checkoutItem] : []}
          onSuccess={() => setCheckoutItem(null)}
        />
      </main>

      <Footer />
    </div>
  );
}
