"use client";

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Package } from 'lucide-react';
import Header from '@/components/Header';
import ElasticCarousel from '@/components/ElasticCarousel';
import ImageModal from '@/components/ImageModal';
import Footer from '@/components/Footer';
import { ComboData } from '@/data/combos';
import { useCart } from '@/app/context/CartContext';
import CheckoutModal from '@/components/CheckoutModal';
import { ShoppingCart } from 'lucide-react';

interface ComboDetailClientProps {
  combo: ComboData;
}

export default function ComboDetailClient({ combo }: ComboDetailClientProps) {
  const [openIndices, setOpenIndices] = useState<number[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { addToCart } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const toggleFAQ = (index: number) => {
    if (openIndices.includes(index)) {
      setOpenIndices(openIndices.filter(i => i !== index));
    } else {
      setOpenIndices([...openIndices, index]);
    }
  };

  const features = combo.features || [];
  const includes = combo.includes || [];
  const faq = combo.faq || [];

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-x-hidden font-sans">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 md:px-8 py-8 w-full z-10 relative">
        <nav className="text-sm text-zinc-400 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-white transition">Home</Link>
          <span>/</span>
          <span className="text-zinc-400">Combo</span>
          <span>/</span>
          <span className="text-white font-semibold break-words">{combo.name}</span>
        </nav>

        <div className="w-full bg-zinc-950/80 border border-zinc-800 rounded-2xl p-6 md:p-10 backdrop-blur-md shadow-2xl relative overflow-hidden max-w-7xl">
          <div className={`absolute top-0 right-0 w-96 h-96 ${combo.glow} rounded-full blur-3xl opacity-30 z-0 pointer-events-none`}></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-zinc-800 bg-[#050505] shadow-inner">
                <img src={combo.image} alt={combo.name} className="w-full h-full object-cover" />
              </div>

              <section className="space-y-4">
                <h3 className="text-xl font-bold text-white border-l-4 border-neonPurple pl-3">Combo Bao Gồm:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {includes.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 flex items-center gap-3">
                      <Package className="w-6 h-6 text-neonPurple" />
                      <span className="font-medium text-white">{item}</span>
                    </div>
                  ))}
                </div>
              </section>

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
            </div>

            <div className="lg:col-span-4 space-y-6 flex flex-col justify-between">
              <div className="space-y-6">
                <span className="inline-block bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                  {combo.tag}
                </span>
                
                <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight break-words">
                  {combo.titlePrefix} <span className={`text-transparent bg-clip-text bg-gradient-to-r ${combo.theme}`}>{combo.titleHighlight}</span>
                </h2>
                
                <p className="text-zinc-400 text-sm md:text-base leading-relaxed break-words">
                  {combo.description}
                </p>

                <div className="border-t border-zinc-800 pt-6">
                  <h4 className="text-sm font-bold text-zinc-300 mb-3">Lợi ích khi Mua Combo</h4>
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
                    <span className="text-3xl font-extrabold text-white">{combo.price}</span>
                    {combo.originalPriceText && <span className="text-lg text-zinc-500 line-through">{combo.originalPriceText}</span>}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => setIsCheckoutOpen(true)}
                    className="flex-1 py-4 rounded-xl font-bold text-zinc-950 bg-gradient-to-r from-neonGreen to-emerald-400 hover:scale-[1.02] transition transform shadow-[0_0_20px_rgba(34,197,94,0.3)] text-center text-base"
                  >
                    Mua Ngay
                  </button>
                  <button 
                    onClick={() => {
                      addToCart({
                        id: combo.id,
                        name: combo.name,
                        priceText: combo.price,
                        originalPriceText: combo.originalPriceText,
                        type: 'combo'
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

        <CheckoutModal 
          isOpen={isCheckoutOpen} 
          onClose={() => setIsCheckoutOpen(false)} 
          items={[{
            id: combo.id,
            name: combo.name,
            priceText: combo.price,
            originalPriceText: combo.originalPriceText,
            type: 'combo'
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
