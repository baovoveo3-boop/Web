"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle, ShoppingCart } from 'lucide-react';
import Header from '@/components/Header';
import ElasticCarousel from '@/components/ElasticCarousel';
import ImageModal from '@/components/ImageModal';
import Footer from '@/components/Footer';
import { useCart } from '@/app/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import CheckoutModal from '@/components/CheckoutModal';
import { ToolData } from '@/data/tools';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ToolDetailClientProps {
  tool: ToolData;
}

export default function ToolDetailClient({ tool }: ToolDetailClientProps) {
  const [openIndices, setOpenIndices] = useState<number[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { addToCart } = useCart();
  const { user, userData } = useAuth();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [promoParam, setPromoParam] = useState('');
  const [isDirectPurchasing, setIsDirectPurchasing] = useState(false);
  const [isActivatingTrial, setIsActivatingTrial] = useState(false);
  const enableTrial = tool.allow_trial === true;

  const handleTrial = async () => {
    if (!user) {
      alert("Vui lòng đăng nhập để nhận dùng thử!");
      return;
    }
    setIsActivatingTrial(true);
    try {
      const res = await fetch('/api/trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, toolId: tool.id })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Đã kích hoạt 3 ngày dùng thử thành công!");
      } else {
        alert("Lỗi: " + (data.error || 'Unknown Error'));
      }
    } catch (e) {
      console.error(e);
      alert("Lỗi kết nối đến máy chủ.");
    } finally {
      setIsActivatingTrial(false);
    }
  };

  const handleDirectPurchase = async () => {
    if (!user) {
      alert("Vui lòng đăng nhập để mua hàng!");
      return;
    }
    const cleanPrice = parseInt(tool.price.replace(/[^\d]/g, ''), 10);
    if (!cleanPrice || isNaN(cleanPrice)) {
      alert("Lỗi: Không thể định dạng giá sản phẩm.");
      return;
    }
    setIsDirectPurchasing(true);
    try {
      const res = await fetch('/api/payment/create-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: cleanPrice,
          description: `Mua ${tool.name}`,
          userId: user.uid,
          userEmail: user.email,
          type: 'direct_purchase',
          toolIds: [tool.id]
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
      setIsDirectPurchasing(false);
    }
  };

  // Helper to parse [Text](URL) into clickable links
  const renderTextWithLinks = (text: string) => {
    if (!text) return text;
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = markdownLinkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const isInternal = match[2].startsWith('/');
      parts.push(
        <Link key={match.index} href={match[2]} target={isInternal ? undefined : "_blank"} rel={isInternal ? undefined : "noopener noreferrer"} className="text-neonPurple hover:underline font-bold">
          {match[1]}
        </Link>
      );
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    return parts.length > 0 ? <>{parts}</> : text;
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const promo = params.get('promo') || '';
      // Sanitize input to prevent script execution
      const sanitized = promo.replace(/<[^>]*>/g, '').replace(/script/gi, '');
      setPromoParam(sanitized);
    }
  }, []);

  const handleDownloadTool = () => {
    if (!user || !userData) {
      alert("Vui lòng đăng nhập để tải công cụ!");
      window.location.href = "/login";
      return;
    }
    
    // 1. Kiểm tra Quyền Truy Cập (Paywall)
    const isPremium = tool.price !== "Miễn phí";
    const hasAccess = !isPremium || 
      userData.currentTier === "vip" || 
      userData.currentTier === "ultimate" || 
      userData.purchasedProducts?.some(p => p.id === tool.id);

    if (!hasAccess) {
      if (confirm("Công cụ này yêu cầu gói VIP/Ultimate hoặc phải mua lẻ. Bạn có muốn đi đến trang Nạp tiền để nâng cấp gói?")) {
        window.location.href = "/hub?tab=wallet";
      }
      return;
    }

    // 2. Tải Tool
    alert("Bắt đầu tải công cụ... (Tính năng đang phát triển)");
  };

  const toggleFAQ = (index: number) => {
    if (openIndices.includes(index)) {
      setOpenIndices(openIndices.filter(i => i !== index));
    } else {
      setOpenIndices([...openIndices, index]);
    }
  };

  const plan = tool.id === 'ban-content' ? 'vip' : 'ultimate';
  // Chuyển hướng người dùng chưa đăng nhập về trang đăng nhập
  const ctaHref = `/login?redirect=/hub?plan=${plan}&billing=monthly`;

  // Safe checks for optional fields
  const features = tool.features || [];
  const howToUse = tool.howToUse || [];
  const faq = tool.faq || [];

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-x-hidden font-sans">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 md:px-8 py-8 w-full z-10 relative">
        {/* Breadcrumbs */}
        <nav data-testid="breadcrumb" className="text-sm text-zinc-400 mb-6 flex items-center gap-2">
          <Link href="/" data-testid="breadcrumb-home" className="hover:text-white transition">
            Home
          </Link>
          <span>/</span>
          <Link href="/#tools" data-testid="breadcrumb-tools" className="text-zinc-400 hover:text-white transition">
            Tools
          </Link>
          <span>/</span>
          <span data-testid="breadcrumb-current" className="text-white font-semibold break-words">
            {tool.name}
          </span>
        </nav>

        {/* Main Details Card Container */}
        <div 
          data-testid="tool-detail-container"
          className="w-full bg-zinc-950/80 border border-zinc-800 rounded-2xl p-6 md:p-10 backdrop-blur-md shadow-2xl relative overflow-hidden max-w-7xl"
        >
          {/* Glowing Background Glow */}
          <div className={`absolute top-0 right-0 w-96 h-96 ${tool.glow} rounded-full blur-3xl opacity-30 z-0 pointer-events-none`}></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Media Showcase, How to Use, FAQ */}
            <div className="lg:col-span-8 space-y-8">
              {/* Media Showcase & Gallery */}
              <div data-testid="tool-media-container" className="flex flex-col gap-6">
                {/* Khung kính Glassmorphism (Product Box) */}
                <div className="w-full flex justify-center items-center">
                  <div className="relative w-full max-w-[320px] aspect-square rounded-2xl overflow-hidden border border-zinc-700/80 bg-[#050505] shadow-[0_0_40px_rgba(168,85,247,0.25)] transition-all duration-500 hover:shadow-[0_0_60px_rgba(168,85,247,0.4)] hover:border-neonPurple/50 group">
                    <div className={`absolute inset-0 bg-gradient-to-tr ${tool.glow} via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none`}></div>
                    <img 
                      src={tool.image} 
                      data-testid="tool-image"
                      alt={tool.name} 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700 ease-out relative z-0" 
                    />
                  </div>
                </div>

                {/* Trượt hình màn hình thực tế (Gallery) */}
                {tool.gallery && tool.gallery.length > 0 && (
                  <div className="w-full mt-4 border-t border-zinc-800/50 pt-6">
                    <h4 className="text-sm font-bold text-zinc-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-neonPurple"></span>
                      Hình Ảnh Thực Tế
                    </h4>
                    <ElasticCarousel className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                      {tool.gallery.map((imgSrc, idx) => (
                        <div key={idx} className="w-[240px] md:w-[280px] snap-center shrink-0 cursor-pointer">
                          <div onClick={() => setSelectedImage(imgSrc)} className="relative aspect-video rounded-xl overflow-hidden border border-zinc-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.5)] group/gallery hover:border-neonPurple/50 transition-colors">
                            <img src={imgSrc} alt={`${tool.name} screenshot ${idx + 1}`} className="w-full h-full object-cover transform group-hover/gallery:scale-105 transition duration-500" />
                          </div>
                        </div>
                      ))}
                    </ElasticCarousel>
                  </div>
                )}
              </div>

              {/* How to Use Guide */}
              <section data-testid="tool-how-to-use" className="space-y-4">
                <h3 className="text-xl font-bold text-white border-l-4 border-neonPurple pl-3">Hướng Dẫn Sử Dụng</h3>
                <div className="space-y-3">
                  {howToUse.map((step, idx) => (
                    <div 
                      key={idx} 
                      data-testid="tool-how-to-use-step" 
                      className="flex items-start gap-4 p-4 rounded-xl border border-zinc-900 bg-zinc-950/50"
                    >
                      <span className="w-8 h-8 rounded-full bg-neonPurple/20 text-neonPurple flex items-center justify-center font-bold flex-shrink-0">
                        {idx + 1}
                      </span>
                      <p className="text-zinc-300 text-sm md:text-base leading-relaxed break-words">{renderTextWithLinks(step)}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* FAQ Section */}
              {faq.length > 0 && (
                <section data-testid="tool-faq" className="space-y-4">
                  <h3 className="text-xl font-bold text-white border-l-4 border-neonGreen pl-3">Câu Hỏi Thường Gặp</h3>
                  <div className="space-y-3">
                    {faq.map((item, idx) => {
                      const isOpen = openIndices.includes(idx);
                      return (
                        <div 
                          key={idx} 
                          data-testid="tool-faq-item" 
                          className="border border-zinc-850 rounded-xl bg-zinc-900/30 overflow-hidden"
                        >
                          <button
                            type="button"
                            data-testid="tool-faq-question"
                            onClick={() => toggleFAQ(idx)}
                            className="w-full flex items-center justify-between p-4 text-left font-bold text-white hover:bg-zinc-900/50 transition duration-200"
                          >
                            <span className="break-words">{item.question}</span>
                            <span className={`text-neonGreen transform transition duration-300 ${isOpen ? 'rotate-45' : ''}`}>
                              <CheckCircle className="w-5 h-5" />
                            </span>
                          </button>
                          <div 
                            data-testid="tool-faq-answer"
                            className={`px-4 pb-4 text-zinc-400 text-sm md:text-base leading-relaxed break-words transition-all duration-300 ${isOpen ? 'block' : 'hidden'}`}
                          >
                            {item.answer}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>

            {/* Right Column: Main Info Block & CTA & Sidebar Hot Tools */}
            <div data-testid="tool-main-info" className="lg:col-span-4 space-y-6 flex flex-col justify-between">
              <div className="space-y-6">
                <span data-testid="tool-tag" className="inline-block bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                  {tool.tag}
                </span>
                
                <h2 data-testid="tool-title" className="text-2xl md:text-3xl font-extrabold text-white leading-tight break-words">
                  {tool.titlePrefix} <span className={`text-transparent bg-clip-text bg-gradient-to-r ${tool.theme}`}>{tool.titleHighlight}</span>
                </h2>
                
                <p data-testid="tool-description" className="text-zinc-400 text-sm md:text-base leading-relaxed break-words">
                  {tool.description}
                </p>

                <div className="border-t border-zinc-800 pt-6">
                  <h4 className="text-sm font-bold text-zinc-300 mb-3">Tính Năng Nổi Bật</h4>
                  <ul data-testid="tool-features-list" className="space-y-3">
                    {features.map((feat, idx) => (
                      <li key={idx} data-testid="tool-feature-item" className="flex items-start gap-3 text-sm text-zinc-300">
                        <CheckCircle className="w-5 h-5 text-neonGreen flex-shrink-0 mt-0.5" />
                        <span className="break-words">
                          <strong className="text-white">{feat.bold}</strong> {feat.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-zinc-800 pt-6">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider block">Giá Đăng Ký</span>
                  <span data-testid="tool-price" className="text-2xl font-extrabold text-white">
                    {tool.price}
                    <span className="text-sm font-normal text-zinc-500">/tháng</span>
                  </span>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  {enableTrial && (
                    <button 
                      onClick={handleTrial}
                      disabled={isActivatingTrial}
                      className="w-full py-3 rounded-xl font-bold text-center text-zinc-950 bg-gradient-to-r from-yellow-400 to-amber-500 hover:scale-[1.02] transition transform shadow-[0_0_20px_rgba(251,191,36,0.3)] block text-sm"
                    >
                      {isActivatingTrial ? "Đang xử lý..." : "🎁 Nhận 3 Ngày Dùng Thử"}
                    </button>
                  )}
                  <button 
                    onClick={handleDirectPurchase}
                    disabled={isDirectPurchasing}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-zinc-950 bg-gradient-to-r from-neonGreen to-emerald-400 hover:scale-[1.02] transition transform shadow-[0_0_20px_rgba(34,197,94,0.3)] text-base"
                  >
                    {isDirectPurchasing ? (
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin"></span>
                        Đang tạo Link...
                      </span>
                    ) : (
                      <>
                        <span>⚡ Mua Trực Tiếp (PayOS)</span>
                      </>
                    )}
                  </button>
                  <button 
                    onClick={() => {
                      addToCart({
                        id: tool.id,
                        name: tool.name,
                        priceText: tool.price,
                        originalPriceText: tool.originalPriceText,
                        type: 'tool'
                      });
                      alert('Đã thêm vào giỏ hàng!');
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 hover:border-zinc-500 transition text-white font-semibold text-sm"
                    title="Thêm vào giỏ hàng"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>🛒 Thêm Vào Giỏ Hàng (Mua bằng ví)</span>
                  </button>
                </div>
              </div>

              {/* Sidebar Hot Tools navigation section */}
              <div className="border-t border-zinc-800 pt-6 space-y-4">
                <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Hot Tools</h4>
                <div className="grid grid-cols-1 gap-3">
                  <Link 
                    href="/tools/ban-content" 
                    data-testid="hot-tool-ban-content"
                    className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-950 hover:border-neonPurple hover:bg-zinc-900 transition text-sm text-zinc-300 hover:text-white"
                  >
                    <span>🚀 Ban Content Automation</span>
                    <span className="text-xs text-neonPurple font-bold">Chi tiết →</span>
                  </Link>
                  <Link 
                    href="/tools/healing-bird" 
                    data-testid="hot-tool-healing-bird"
                    className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-950 hover:border-neonGreen hover:bg-zinc-900 transition text-sm text-zinc-300 hover:text-white"
                  >
                    <span>🌿 Healing Bird Tool</span>
                    <span className="text-xs text-neonGreen font-bold">Chi tiết →</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ImageModal 
          isOpen={!!selectedImage} 
          onClose={() => setSelectedImage(null)} 
          imageSrc={selectedImage || ''} 
          altText="Screenshot zoom" 
        />
      </main>

      <Footer />
    </div>
  );
}
