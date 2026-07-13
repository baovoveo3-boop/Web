"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Download, AlertTriangle, RefreshCw } from "lucide-react";
import CircuitAnimation from "@/components/CircuitAnimation";
import { useAuth } from "@/context/AuthContext";

interface SettingsData {
  version: string;
  download_url: string;
  force_update?: boolean;
}

export default function DownloadPage() {
  const { user, userData } = useAuth();
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);

  const displayName = userData?.displayName?.split(' ')[0] || user?.email?.split('@')[0];

  // Hàm chuyển đổi link Google Drive sang định dạng Direct Download
  const getDirectDownloadUrl = (url: string) => {
    if (!url) return "";
    try {
      if (url.includes('drive.google.com') || url.includes('drive.usercontent.google.com')) {
        const urlObj = new URL(url);
        let fileId = urlObj.searchParams.get('id');
        
        if (!fileId) {
          // Xử lý link dạng: https://drive.google.com/file/d/ID/view
          const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
          if (match && match[1]) {
            fileId = match[1];
          }
        }
        
        if (fileId) {
          // Thêm confirm=t để cố gắng bypass màn hình quét virus cho file lớn
          return `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
        }
      }
    } catch (e) {
      console.error("Lỗi format URL:", e);
    }
    return url;
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "settings", "general");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as SettingsData;
          setSettings(data);
        } else {
          setSettings(null);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        setSettings(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const hasSettings = settings && settings.download_url && settings.download_url.trim() !== "";

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0510] text-zinc-100 overflow-x-hidden font-sans">
      <Header />
      
      <main className="flex-grow">
        <div className="relative w-full h-full min-h-screen flex items-start justify-center pt-32 pb-20">
          <div className="absolute inset-0 bg-[url('/circuit-bg.jpg')] bg-cover bg-center bg-fixed opacity-40 z-0"></div>
          
          <div className="absolute inset-0 z-0">
             <CircuitAnimation />
          </div>

          <div className="relative z-10 w-full max-w-3xl flex flex-col items-center justify-center mx-4 my-8 space-y-8">
            
            {/* Message Banner */}
            <div className="w-full bg-zinc-900/60 backdrop-blur-xl border border-neonPurple/30 p-6 md:p-8 rounded-3xl shadow-[0_0_30px_rgba(168,85,247,0.1)] text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-neonPurple/5 to-transparent opacity-50"></div>
              <div className="relative z-10">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-5">
                  Xin chào {displayName ? <span className="text-neonPurple">{displayName}</span> : "Khách Hàng"}! 👋
                </h2>
                <p className="text-zinc-300 text-base md:text-lg leading-relaxed mb-5">
                  Tất cả Tool, App automation đều được Quản Lý và khởi chạy trực tiếp trên <strong>App Launcher</strong>. 
                  <br className="hidden md:block"/>Quý Khách Hàng vui lòng Download phần mềm trong phần bên dưới, Cài Đặt và Khởi Động trước khi chạy tool.
                </p>
                <p className="text-zinc-400 text-base font-semibold italic">
                  BT AI LABs trân trọng biết ơn.
                </p>
              </div>
            </div>

            {/* App Launcher Download Card */}
            <div className="w-full max-w-lg bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 p-8 rounded-3xl shadow-2xl overflow-hidden relative">
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent"></div>

            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-neonPurple to-indigo-600 flex items-center justify-center shadow-lg shadow-neonPurple/20">
                <Download className="w-8 h-8 text-white animate-bounce" />
              </div>

              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">App Launcher</h1>
                <p className="text-zinc-400 text-sm mt-2">
                  Trình khởi chạy tối ưu để tải và quản lý các công cụ tự động hóa của bạn
                </p>
              </div>

              {loading ? (
                <div className="py-8 flex flex-col items-center justify-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-neonPurple animate-spin" />
                  <span className="text-zinc-500 text-xs">Đang kiểm tra phiên bản mới nhất...</span>
                </div>
              ) : !hasSettings ? (
                <div className="space-y-6">
                  <div className="p-4 bg-red-950/30 border border-red-900/30 rounded-2xl flex items-start gap-3 text-left">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-bold text-red-400">Thông báo</h3>
                      <p className="text-xs text-zinc-400 mt-1">Không tìm thấy phiên bản ứng dụng</p>
                    </div>
                  </div>

                  <button
                    disabled
                    className="w-full py-4 px-6 rounded-2xl bg-zinc-800 text-zinc-500 font-bold text-base cursor-not-allowed border border-zinc-700/50 flex items-center justify-center gap-2"
                  >
                    Tải App Launcher
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-800/60 border border-zinc-700/50 rounded-full text-xs font-semibold text-zinc-300 max-w-full">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                    <span className="break-all">Phiên bản: {settings.version || "1.0.0"}</span>
                  </div>

                  <div className="space-y-3">
                    <a
                      href={getDirectDownloadUrl(settings.download_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-neonPurple to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-base transition duration-300 shadow-lg shadow-neonPurple/20 hover:shadow-neonPurple/40 hover:-translate-y-0.5 flex items-center justify-center gap-2 group cursor-pointer"
                    >
                      <span>Tải App Launcher cho PC</span>
                      <Download className="w-5 h-5 group-hover:translate-y-0.5 transition duration-300" />
                    </a>
                    <p className="text-zinc-500 text-xs">
                      Hỗ trợ hệ điều hành Windows 10/11 x64
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
