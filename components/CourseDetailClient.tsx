"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle, BookOpen, PlayCircle } from 'lucide-react';
import Header from '@/components/Header';
import ElasticCarousel from '@/components/ElasticCarousel';
import ImageModal from '@/components/ImageModal';
import Footer from '@/components/Footer';
import { CourseData } from '@/data/courses';
import { useCart } from '@/app/context/CartContext';
import { useAuth, registerWebDevice } from '@/context/AuthContext';
import CheckoutModal from '@/components/CheckoutModal';
import { ShoppingCart } from 'lucide-react';

interface CourseDetailClientProps {
  course: CourseData;
}

export default function CourseDetailClient({ course }: CourseDetailClientProps) {
  const [openIndices, setOpenIndices] = useState<number[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { addToCart } = useCart();
  const { user, userData } = useAuth();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleEnterCourse = async () => {
    if (!user || !userData) {
      alert("Vui lòng đăng nhập để truy cập khóa học!");
      window.location.href = "/login";
      return;
    }
    
    // 1. Kiểm tra Quyền Truy Cập (Paywall)
    const isPremium = course.price !== "Miễn phí";
    const hasAccess = !isPremium || 
      userData.currentTier === "vip" || 
      userData.currentTier === "ultimate" || 
      userData.purchasedProducts?.some(p => p.id === course.id);

    if (!hasAccess) {
      if (confirm("Nội dung này yêu cầu gói VIP/Ultimate hoặc phải mua lẻ. Bạn có muốn đi đến trang Nạp tiền để nâng cấp gói?")) {
        window.location.href = "/hub?tab=wallet";
      }
      return;
    }

    // 2. Nếu là khóa học Premium, đăng ký Web Device
    // (Miễn phí thì không cần kiểm tra thiết bị)
    if (isPremium && registerWebDevice) {
      const res = await registerWebDevice(userData.uid, userData.maxWebDevices || 1, userData.webDevices || []);
      if (!res.success) {
        alert(res.error);
        return;
      }
    }

    // 3. Vào học
    alert("Chào mừng bạn vào lớp học! (Tính năng đang phát triển)");
    // window.location.href = `/courses/${course.id}/watch`;
  };

  const toggleFAQ = (index: number) => {
    if (openIndices.includes(index)) {
      setOpenIndices(openIndices.filter(i => i !== index));
    } else {
      setOpenIndices([...openIndices, index]);
    }
  };

  const features = course.features || [];
  const syllabus = course.syllabus || [];
  const faq = course.faq || [];

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-x-hidden font-sans">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 md:px-8 py-8 w-full z-10 relative">
        {/* Breadcrumbs */}
        <nav className="text-sm text-zinc-400 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-white transition">Home</Link>
          <span>/</span>
          <span className="text-zinc-400">Khóa học</span>
          <span>/</span>
          <span className="text-white font-semibold break-words">{course.name}</span>
        </nav>

        {/* Main Details Card Container */}
        <div className="w-full bg-zinc-950/80 border border-zinc-800 rounded-2xl p-6 md:p-10 backdrop-blur-md shadow-2xl relative overflow-hidden max-w-7xl">
          <div className={`absolute top-0 right-0 w-96 h-96 ${course.glow} rounded-full blur-3xl opacity-30 z-0 pointer-events-none`}></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-8 space-y-8">
              <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-zinc-800 bg-[#050505] shadow-inner group flex items-center justify-center">
                <img src={course.image} alt={course.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition duration-500" />
                <PlayCircle className="absolute w-20 h-20 text-white/80 group-hover:text-white group-hover:scale-110 transition duration-300 drop-shadow-xl" />
              </div>

              {/* Syllabus */}
              <section className="space-y-4">
                <h3 className="text-xl font-bold text-white border-l-4 border-orange-500 pl-3">Nội dung Khóa học</h3>
                <div className="space-y-4">
                  {syllabus.map((chapter, idx) => (
                    <div key={idx} className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40">
                      <h4 className="font-bold text-lg text-white mb-3 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-orange-400" />
                        {chapter.chapter}: {chapter.title}
                      </h4>
                      <ul className="space-y-2 pl-7">
                        {chapter.lessons.map((lesson, lIdx) => (
                          <li key={lIdx} className="text-zinc-400 text-sm md:text-base list-disc marker:text-zinc-600">
                            {lesson}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>

              {/* FAQ Section */}
              {faq.length > 0 && (
                <section className="space-y-4">
                  <h3 className="text-xl font-bold text-white border-l-4 border-neonGreen pl-3">Câu Hỏi Thường Gặp</h3>
                  <div className="space-y-3">
                    {faq.map((item, idx) => {
                      const isOpen = openIndices.includes(idx);
                      return (
                        <div key={idx} className="border border-zinc-850 rounded-xl bg-zinc-900/30 overflow-hidden">
                          <button onClick={() => toggleFAQ(idx)} className="w-full flex items-center justify-between p-4 text-left font-bold text-white hover:bg-zinc-900/50 transition duration-200">
                            <span className="break-words">{item.question}</span>
                            <span className="ml-2 flex-shrink-0 text-zinc-400">{isOpen ? '▲' : '▼'}</span>
                          </button>
                          <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-96 p-4 border-t border-zinc-850 text-zinc-300' : 'max-h-0 opacity-0'}`}>
                            <p className="text-sm md:text-base leading-relaxed break-words">{item.answer}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>

            {/* Right Column */}
            <div className="lg:col-span-4 space-y-6 flex flex-col justify-between">
              <div className="space-y-6">
                <span className="inline-block bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                  {course.tag}
                </span>
                
                <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight break-words">
                  {course.titlePrefix} <span className={`text-transparent bg-clip-text bg-gradient-to-r ${course.theme}`}>{course.titleHighlight}</span>
                </h2>
                
                <p className="text-zinc-400 text-sm md:text-base leading-relaxed break-words">
                  {course.description}
                </p>

                <div className="border-t border-zinc-800 pt-6">
                  <h4 className="text-sm font-bold text-zinc-300 mb-3">Bạn Sẽ Nhận Được Gì?</h4>
                  <ul className="space-y-3">
                    {features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-zinc-300">
                        <CheckCircle className="w-5 h-5 text-neonGreen flex-shrink-0 mt-0.5" />
                        <span className="break-words"><strong className="text-white">{feat.bold}</strong> {feat.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-zinc-800 pt-6">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider block">Giá Sở Hữu</span>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-extrabold text-white">{course.price}</span>
                    {course.originalPriceText && <span className="text-lg text-zinc-500 line-through">{course.originalPriceText}</span>}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={handleEnterCourse}
                    className="flex-1 py-4 rounded-xl font-bold text-zinc-950 bg-gradient-to-r from-neonGreen to-emerald-400 hover:scale-[1.02] transition transform shadow-[0_0_20px_rgba(34,197,94,0.3)] text-center text-base"
                  >
                    Vào Học Ngay
                  </button>
                  <button 
                    onClick={() => {
                      addToCart({
                        id: course.id,
                        name: course.name,
                        priceText: course.price,
                        originalPriceText: course.originalPriceText,
                        type: 'course'
                      });
                      alert('Đã thêm vào giỏ hàng!');
                    }}
                    className="w-14 h-14 shrink-0 flex items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 hover:border-zinc-500 transition text-white"
                    title="Thêm vào giỏ"
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Checkout Modal */}
        <CheckoutModal 
          isOpen={isCheckoutOpen} 
          onClose={() => setIsCheckoutOpen(false)} 
          items={[{
            id: course.id,
            name: course.name,
            priceText: course.price,
            originalPriceText: course.originalPriceText,
            type: 'course'
          }]}
          onSuccess={() => setIsCheckoutOpen(false)}
        />
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
