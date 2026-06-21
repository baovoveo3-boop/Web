import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer data-testid="footer" className="border-t border-zinc-800 bg-zinc-950 text-zinc-400 py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Column 1: Company Info */}
          <div className="space-y-4">
            <div className="flex items-center mb-4 hover:opacity-80 transition shrink-0">
              <img src="/logo.jpeg" alt="Ban Content Logo" className="w-32 md:w-40 h-auto object-contain mix-blend-screen origin-left" />
            </div>
            <p className="text-sm">
              Nền tảng số 1 Việt Nam cung cấp công cụ MMO, automation AI, workflow n8n/Make giúp cá nhân và doanh nghiệp tự động hóa quy trình, tăng doanh thu.
            </p>
            <div className="space-y-2 mt-4 text-sm">
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-neonPurple" /> Việt Nam</p>
              <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-neonPurple" /> Hỗ trợ 24/7</p>
              <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-neonPurple" /> contact@btailabs.com</p>
            </div>
          </div>

          {/* Column 2: Products */}
          <div className="space-y-4">
            <h4 className="text-white font-bold mb-4">Sản phẩm</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-neonGreen transition">Công cụ Automation</Link></li>
              <li><Link href="#" className="hover:text-neonGreen transition">Workflow n8n / Make</Link></li>
              <li><Link href="#" className="hover:text-neonGreen transition">Khóa học Online</Link></li>
              <li><Link href="#" className="hover:text-neonGreen transition">Dịch vụ MMO</Link></li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="space-y-4">
            <h4 className="text-white font-bold mb-4">Công ty</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-neonPurple transition">Giới thiệu B.T AI LABS</Link></li>
              <li><Link href="#" className="hover:text-neonPurple transition">Blog & Tin tức</Link></li>
              <li><Link href="#" className="hover:text-neonPurple transition">Chương trình Affiliate</Link></li>
              <li><Link href="#" className="hover:text-neonPurple transition">Chính sách bảo mật</Link></li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-4">
            <h4 className="text-white font-bold mb-4">Đăng ký nhận tin</h4>
            <p className="text-sm mb-4">Nhận thông báo về tool mới, mã giảm giá & bí quyết MMO mỗi tuần.</p>
            <div className="flex flex-col gap-2">
              <input 
                type="email" 
                placeholder="Email của bạn..." 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neonPurple"
              />
              <button className="w-full bg-neonPurple hover:bg-neonPurple-dark text-white font-bold py-2 rounded-lg transition">
                Đăng ký ngay
              </button>
            </div>
          </div>

        </div>

        {/* SEO Keywords (Hidden/Subtle) */}
        <div className="border-t border-zinc-900 pt-8 mt-8">
          <p className="text-[11px] text-zinc-600 leading-relaxed text-justify mb-6">
            <strong className="text-zinc-500">TỪ KHÓA PHỔ BIẾN:</strong> tool MMO, automation n8n, workflow make.com, AI agent, ChatGPT API, tool kéo content, tool nuôi nick, tool xác minh, khóa học MMO, kiếm tiền online, tool reup, tool tiktok, tool facebook ads, khóa học AI, scraper, puppeteer, ban content bot.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-between text-xs text-zinc-500">
            <p>© 2026 Ban Content — vận hành bởi B.T AI LABS. Tất cả quyền được bảo lưu.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link href="#" className="hover:text-white">Điều khoản</Link>
              <Link href="#" className="hover:text-white">Bảo mật</Link>
              <Link href="#" className="hover:text-white">Sitemap</Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
