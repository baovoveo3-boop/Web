"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowLeft, PlayCircle, ExternalLink, Download, CheckCircle, ChevronRight, Check, Lock } from "lucide-react";
import CircuitAnimation from "@/components/CircuitAnimation";
import { useAuth } from "@/context/AuthContext";

export default function FreeResourceDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [resource, setResource] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!id) return;

    const fetchResource = async () => {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.category?.toLowerCase() === "free" || data.category?.toLowerCase() === "miễn phí") {
            setResource({ id: docSnap.id, ...data });
          } else {
            router.push("/free");
          }
        } else {
          router.push("/free");
        }
      } catch (error) {
        console.error("Error fetching free resource:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0510] text-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-neonGreen mx-auto mb-4"></div>
          <p className="text-zinc-400 font-mono text-sm uppercase tracking-widest">Đang tải tài nguyên...</p>
        </div>
      </div>
    );
  }

  if (!resource) return null;

  const isVideo = resource.resourceType === "video";
  const isExternalLink = resource.resourceType === "external_link";
  const hasVideoUrl = isVideo && resource.resourceUrl?.trim() !== "";
  
  // Xử lý link youtube và google drive để nhúng iframe
  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    let embedUrl = url;
    if (url.includes("youtube.com/watch")) {
      const videoId = new URL(url).searchParams.get("v");
      if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes("drive.google.com/file/d/")) {
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        embedUrl = `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }
    return embedUrl;
  };

  return (
    <div className="min-h-screen bg-[#0B0510] text-zinc-50 font-sans selection:bg-neonGreen/30 relative overflow-hidden">
      {/* Nền mạch điện */}
      <div className="absolute inset-0 bg-[url('/circuit-bg.jpg')] bg-cover bg-center bg-fixed opacity-10 z-0 pointer-events-none"></div>
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <CircuitAnimation />
      </div>

      <Header />
      
      <main className="pt-24 pb-20 relative z-10 max-w-5xl mx-auto px-4 md:px-8">
        <div className="mb-8 flex flex-wrap items-center text-sm font-medium text-zinc-500 gap-y-2">
          <Link href="/" className="hover:text-neonGreen transition shrink-0">Trang chủ</Link>
          <ChevronRight className="w-4 h-4 mx-2 shrink-0" />
          <Link href="/free" className="hover:text-neonGreen transition shrink-0">Tài nguyên miễn phí</Link>
          <ChevronRight className="w-4 h-4 mx-2 shrink-0" />
          <span className="text-zinc-300 truncate max-w-[200px] shrink-0">{resource.name}</span>
        </div>

        {/* Khối chính hiển thị Nội dung */}
        <div className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
          
          {/* HEADER: HIỂN THỊ VIDEO HOẶC ẢNH BÌA */}
          {hasVideoUrl ? (
            <div className="relative w-full aspect-video bg-black border-b border-zinc-800">
              {!user ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 bg-opacity-90 z-20">
                  <Lock className="w-16 h-16 text-neonGreen mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2 text-center px-4">Đăng nhập để xem video</h3>
                  <p className="text-zinc-400 mb-6 text-center max-w-md px-4">Tạo tài khoản miễn phí trong 2 giây để mở khóa toàn bộ tài nguyên hướng dẫn này.</p>
                  <Link href={`/login?redirect=/free/${id}`} className="px-8 py-3 bg-neonGreen text-zinc-950 font-bold rounded-xl hover:scale-105 transition shadow-[0_0_20px_rgba(34,197,94,0.3)]">Đăng nhập / Đăng ký</Link>
                </div>
              ) : resource.resourceUrl.toLowerCase().endsWith('.mp4') || resource.resourceUrl.includes('firebasestorage.googleapis.com') ? (
                <video 
                  src={resource.resourceUrl} 
                  controls 
                  className="w-full h-full"
                >
                  Trình duyệt của bạn không hỗ trợ thẻ video.
                </video>
              ) : (
                <iframe 
                  src={getEmbedUrl(resource.resourceUrl)} 
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              )}
            </div>
          ) : (
            <div className="relative h-64 md:h-96 w-full overflow-hidden border-b border-zinc-800">
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent z-10"></div>
              {resource.imageUrl ? (
                <img src={resource.imageUrl} alt={resource.name} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
                  <PlayCircle className="w-20 h-20 text-zinc-800" />
                </div>
              )}
            </div>
          )}

          <div className="p-8 md:p-12">
            {resource.badgeText && (
              <span className="inline-block px-3 py-1 bg-neonGreen/10 text-neonGreen text-xs font-bold uppercase tracking-wider rounded-full mb-4 border border-neonGreen/20">
                {resource.badgeText}
              </span>
            )}
            
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {resource.name}
            </h1>
            
            <p className="text-zinc-300 text-lg md:text-xl leading-relaxed mb-10 border-l-4 border-neonGreen pl-4">
              {resource.description}
            </p>

            {/* CTA BUTTON CHO DẠNG LINK TOOL HOẶC RESOURCE TẢI XUỐNG */}
            {isExternalLink && resource.resourceUrl && (
              <div className="mb-12">
                {!user ? (
                  <div className="p-8 bg-zinc-900/80 border border-zinc-800 rounded-2xl flex flex-col items-center text-center backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-neonGreen/10 to-emerald-500/10 opacity-50 pointer-events-none"></div>
                    <Lock className="w-12 h-12 text-neonGreen mb-4 relative z-10" />
                    <h4 className="text-xl font-bold text-white mb-2 relative z-10">Đăng nhập để mở khóa</h4>
                    <p className="text-zinc-400 mb-6 relative z-10">Bạn cần có tài khoản để truy cập công cụ này.</p>
                    <Link href={`/login?redirect=/free/${id}`} className="px-8 py-3 bg-neonGreen text-zinc-950 font-bold rounded-xl hover:scale-105 transition shadow-[0_0_20px_rgba(34,197,94,0.3)] relative z-10">Đăng nhập / Đăng ký</Link>
                  </div>
                ) : (
                  <a 
                    href={resource.resourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-3 w-full md:w-auto bg-gradient-to-r from-neonGreen to-emerald-500 hover:from-emerald-500 hover:to-neonGreen text-zinc-950 font-bold text-lg px-8 py-4 rounded-xl shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:shadow-[0_0_50px_rgba(34,197,94,0.5)] transition-all transform hover:scale-105"
                  >
                    Truy cập Công cụ miễn phí <ExternalLink className="w-5 h-5" />
                  </a>
                )}
              </div>
            )}

            {/* FEATURES / HOW TO USE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
              {resource.features && resource.features.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-neonGreen" /> Tính năng nổi bật
                  </h3>
                  <ul className="space-y-4">
                    {resource.features.map((feature: any, idx: number) => (
                      <li key={idx} className="flex items-start gap-3 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50">
                        <Check className="w-5 h-5 text-neonGreen shrink-0 mt-0.5" />
                        <span className="text-zinc-300 leading-relaxed">
                          <strong className="text-white block mb-1">{feature.bold}</strong>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {resource.howToUse && resource.howToUse.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <PlayCircle className="w-6 h-6 text-emerald-400" /> Hướng dẫn sử dụng
                  </h3>
                  <div className="space-y-4">
                    {resource.howToUse.map((step: string, idx: number) => (
                      <div key={idx} className="flex gap-4 items-start">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 font-mono font-bold text-sm shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                          {idx + 1}
                        </div>
                        <p className="text-zinc-300 pt-1 leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* DOWNLOAD URL (NẾU CÓ) CHO TOOL OFFLINE HOẶC EBOOK */}
            {resource.download_url && (
              <div className="mt-12 p-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex flex-col items-center text-center relative overflow-hidden">
                {!user && (
                   <div className="absolute inset-0 backdrop-blur-md bg-zinc-950/80 z-10 flex flex-col items-center justify-center">
                     <Lock className="w-10 h-10 text-neonGreen mb-3" />
                     <p className="text-zinc-300 font-medium mb-4">Đăng nhập để hiển thị file tải xuống</p>
                     <Link href={`/login?redirect=/free/${id}`} className="px-6 py-2 bg-neonGreen text-zinc-950 font-bold rounded-lg hover:scale-105 transition">Đăng nhập / Đăng ký</Link>
                   </div>
                )}
                <Download className="w-12 h-12 text-zinc-500 mb-4" />
                <h4 className="text-xl font-bold text-white mb-2">Tài nguyên kèm theo</h4>
                <p className="text-zinc-400 mb-6">Tải xuống các file thực hành, template hoặc ứng dụng đính kèm.</p>
                <a 
                  href={resource.download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg transition inline-flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Tải xuống ngay
                </a>
              </div>
            )}

          </div>
        </div>
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
