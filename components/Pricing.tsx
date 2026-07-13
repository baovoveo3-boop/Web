"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function Pricing() {
  const [activeCategory, setActiveCategory] = useState<'subscription' | 'retail'>('subscription');
  const [retailBilling, setRetailBilling] = useState<'monthly' | 'lifetime'>('monthly');
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section 
      id="pricing"
      data-testid="pricing-section"
      className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8"
    >
      <div className="text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Bảng Giá Dịch Vụ
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-xl text-zinc-400">
          Lựa chọn gói phù hợp với nhu cầu của bạn. Nâng cấp hoặc hủy bất kỳ lúc nào.
        </p>
      </div>

      {/* Main Category Toggle */}
      <div className="mt-10 flex justify-center">
        <div className="bg-zinc-900/50 p-1.5 rounded-2xl flex flex-col sm:flex-row gap-1 border border-zinc-800 w-full max-w-[90%] sm:w-auto">
          <button
            onClick={() => setActiveCategory('subscription')}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeCategory === 'subscription' 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            Gói Thành Viên (Tất cả Tool)
          </button>
          <button
            onClick={() => setActiveCategory('retail')}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeCategory === 'retail' 
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            Thuê/Mua Lẻ Tool
          </button>
        </div>
      </div>

      {/* Billing Toggle for Subscriptions */}
      {activeCategory === 'subscription' && (
        <div className="mt-8 flex justify-center items-center gap-4">
          <span className={`text-sm font-medium ${!isYearly ? 'text-white' : 'text-zinc-500'}`}>Thanh toán hàng tháng</span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            data-testid="pricing-toggle"
            className="relative inline-flex h-7 w-14 items-center rounded-full bg-zinc-800 border border-zinc-700 transition-colors focus:outline-none"
          >
            <span className={`${isYearly ? 'translate-x-8 bg-purple-500' : 'translate-x-1 bg-zinc-500'} inline-block h-5 w-5 transform rounded-full transition-all`} />
          </button>
          <span className={`text-sm font-medium ${isYearly ? 'text-white' : 'text-zinc-500'}`}>
            Thanh toán hàng năm <span className="ml-1.5 rounded-md bg-purple-500/20 px-2 py-0.5 text-[10px] text-purple-400 font-bold uppercase tracking-wide">Tiết kiệm 20%</span>
          </span>
        </div>
      )}

      {activeCategory === 'subscription' ? (
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Free Plan */}
          <div data-testid="pricing-card-free" className="flex flex-col justify-between rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8 shadow-sm hover:border-zinc-700 transition-colors">
            <div>
              <h3 className="text-xl font-bold text-zinc-300">Dùng Thử</h3>
              <p className="mt-4 text-zinc-400 text-sm h-10">Trải nghiệm cơ bản để làm quen với hệ thống.</p>
              <div className="mt-6 flex items-baseline">
                <span data-testid="price-value-free" className="text-4xl font-extrabold text-white">0đ</span>
              </div>
              <ul className="mt-8 space-y-4 text-sm text-zinc-300">
                <li className="flex items-center gap-2"><span className="text-zinc-500">✅</span> Truy cập tất cả Công cụ cơ bản, Kho Ứng Dụng Miễn Phí</li>
                <li className="flex items-center gap-2"><span className="text-zinc-500">✅</span> Giới hạn: Dùng Thử 1 Tool/1 ngày</li>
                <li className="flex items-center gap-2"><span className="text-zinc-500">✅</span> Tốc độ xử lý: Tiêu chuẩn (xếp hàng chờ)</li>
                <li className="flex items-center gap-2 text-zinc-500"><span className="text-red-900/50">❌</span> Không có Voice Clone</li>
                <li className="flex items-center gap-2 text-zinc-500"><span className="text-red-900/50">❌</span> Không ưu tiên hỗ trợ</li>
              </ul>
            </div>
            <Link href="/hub?plan=free&billing=monthly" data-testid="pricing-select-free" className="mt-8 block w-full rounded-xl bg-zinc-800 py-3 text-center text-sm font-semibold text-white hover:bg-zinc-700 transition">
              Bắt đầu miễn phí
            </Link>
          </div>

          {/* Plus Plan (VIP) */}
          <div data-testid="pricing-card-vip" className="flex flex-col justify-between rounded-3xl border border-blue-500/30 bg-blue-900/10 p-8 shadow-sm relative hover:border-blue-500/50 transition-colors">
            <div data-testid="pricing-vip-badge" className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
              Phổ Biến
            </div>
            <div>
              <h3 className="text-xl font-bold text-blue-400">Plus (Chuyên Gia)</h3>
              <p className="mt-4 text-zinc-400 text-sm h-10">Công cụ chuyên sâu dành cho Content Creator.</p>
              <div className="mt-6 flex items-baseline">
                <span data-testid="price-value-vip" className="text-4xl font-extrabold text-white">
                  {isYearly ? '5.99M' : '699K'}
                </span>
                <span className="ml-1 text-xl font-semibold text-zinc-500">
                  {isYearly ? '/năm' : '/tháng'}
                </span>
              </div>
              <ul className="mt-8 space-y-4 text-sm text-zinc-300">
                <li className="flex items-center gap-2"><span className="text-blue-500">✅</span> Truy cập toàn bộ Công cụ (gồm VIP Tools)</li>
                <li className="flex items-center gap-2"><span className="text-blue-500">✅</span> Giới hạn: 3 Tool Không Giới Hạn</li>
                <li className="flex items-center gap-2"><span className="text-blue-500">✅</span> Tốc độ xử lý: Nhanh (Server riêng)</li>
                <li className="flex items-center gap-2"><span className="text-blue-500">✅</span> Mở khóa Voice Clone cơ bản</li>
                <li className="flex items-center gap-2"><span className="text-blue-500">✅</span> Hỗ trợ qua Kênh Email / Ticket</li>
              </ul>
            </div>
            <Link href={isYearly ? "/hub?plan=vip&billing=yearly" : "/hub?plan=vip&billing=monthly"} data-testid="pricing-select-vip" className="mt-8 block w-full rounded-xl bg-blue-600/20 border border-blue-500/50 py-3 text-center text-sm font-semibold text-blue-400 hover:bg-blue-600 hover:text-white transition">
              Đăng ký Gói VIP
            </Link>
          </div>

          {/* Premium Plan (Ultimate) */}
          <div data-testid="pricing-card-ultimate" className="relative flex flex-col justify-between rounded-3xl border-2 border-purple-500 bg-[#1e1e24] p-8 shadow-[0_0_40px_rgba(168,85,247,0.2)]">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
              Khuyên Dùng
            </div>
            <div>
              <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Premium (Vượt Trội)</h3>
              <p className="mt-4 text-zinc-300 text-sm h-10">Giải pháp toàn diện cho Studio & Doanh nghiệp.</p>
              <div className="mt-6 flex items-baseline">
                <span data-testid="price-value-ultimate" className="text-4xl font-extrabold text-white">
                  {isYearly ? '15.99M' : '1.99M'}
                </span>
                <span className="ml-1 text-xl font-semibold text-zinc-500">
                  {isYearly ? '/năm' : '/tháng'}
                </span>
              </div>
              <ul className="mt-8 space-y-4 text-sm text-zinc-300">
                <li className="flex items-center gap-2"><span className="text-purple-500">✅</span> KHÔNG GIỚI HẠN số Tool</li>
                <li className="flex items-center gap-2"><span className="text-purple-500">✅</span> Tốc độ xử lý: Super VIP (Render siêu tốc)</li>
                <li className="flex items-center gap-2"><span className="text-purple-500">✅</span> Voice Clone Cao cấp (Cảm xúc, đa ngôn ngữ)</li>
                <li className="flex items-center gap-2"><span className="text-purple-500">✅</span> Hỗ trợ 1:1 trực tiếp qua Zalo/Telegram</li>
                <li className="flex items-center gap-2"><span className="text-purple-500">✅</span> Yêu cầu thêm tính năng (Request Feature)</li>
              </ul>
            </div>
            <Link href={isYearly ? "/hub?plan=ultimate&billing=yearly" : "/hub?plan=ultimate&billing=monthly"} data-testid="pricing-select-ultimate" className="mt-8 block w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-3 text-center text-sm font-bold text-white hover:opacity-90 transition shadow-lg shadow-purple-500/25">
              Nâng cấp Ultimate
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Retail Sub-Toggle */}
          <div className="mt-12 flex justify-center items-center gap-4">
            <span className={`text-sm font-medium ${retailBilling === 'monthly' ? 'text-white' : 'text-zinc-500'}`}>Thuê Tháng</span>
            <button
              onClick={() => setRetailBilling(retailBilling === 'monthly' ? 'lifetime' : 'monthly')}
              className="relative inline-flex h-7 w-14 items-center rounded-full bg-zinc-800 border border-zinc-700 transition-colors focus:outline-none"
            >
              <span className={`${retailBilling === 'lifetime' ? 'translate-x-8 bg-teal-500' : 'translate-x-1 bg-emerald-500'} inline-block h-5 w-5 transform rounded-full transition-all`} />
            </button>
            <span className={`text-sm font-medium ${retailBilling === 'lifetime' ? 'text-white' : 'text-zinc-500'}`}>
              Mua Đứt Vĩnh Viễn <span className="ml-1.5 rounded-md bg-teal-500/20 px-2 py-0.5 text-[10px] text-teal-400 font-bold uppercase tracking-wide">Tiết Kiệm</span>
            </span>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Healing Bird */}
            <div className="flex flex-col justify-between rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8 shadow-sm">
              <div>
                <h3 className="text-lg font-bold text-zinc-200">Healing Bird Tool</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-3xl font-extrabold text-emerald-400">
                    {retailBilling === 'monthly' ? '299K' : '1.99M'}
                  </span>
                  <span className="ml-1 text-sm font-medium text-zinc-500">
                    {retailBilling === 'monthly' ? '/tháng' : '/vĩnh viễn'}
                  </span>
                </div>
                <ul className="mt-6 space-y-3 text-sm text-zinc-400">
                  <li>• Tự động tách nền chim</li>
                  <li>• Làm nét lông cánh chim</li>
                  <li>• Xử lý ảnh hàng loạt</li>
                </ul>
              </div>
              <button className="mt-6 w-full rounded-xl bg-zinc-800/50 border border-zinc-700 py-2.5 text-sm font-semibold text-zinc-300 hover:text-white hover:bg-zinc-700 transition">
                {retailBilling === 'monthly' ? 'Thuê ngay' : 'Mua đứt'}
              </button>
            </div>

            {/* Ban Content */}
            <div className="flex flex-col justify-between rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8 shadow-sm">
              <div>
                <h3 className="text-lg font-bold text-zinc-200">Ban Content Tool</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-3xl font-extrabold text-emerald-400">
                    {retailBilling === 'monthly' ? '399K' : '2.49M'}
                  </span>
                  <span className="ml-1 text-sm font-medium text-zinc-500">
                    {retailBilling === 'monthly' ? '/tháng' : '/vĩnh viễn'}
                  </span>
                </div>
                <ul className="mt-6 space-y-3 text-sm text-zinc-400">
                  <li>• Lách bản quyền Video siêu tốc</li>
                  <li>• Lật/Đổi màu/Chỉnh giọng AI</li>
                  <li>• Render cực nhanh</li>
                </ul>
              </div>
              <button className="mt-6 w-full rounded-xl bg-zinc-800/50 border border-zinc-700 py-2.5 text-sm font-semibold text-zinc-300 hover:text-white hover:bg-zinc-700 transition">
                {retailBilling === 'monthly' ? 'Thuê ngay' : 'Mua đứt'}
              </button>
            </div>

            {/* Combo */}
            <div className="relative flex flex-col justify-between rounded-3xl border border-teal-500/50 bg-teal-900/10 p-8 shadow-[0_0_30px_rgba(20,184,166,0.15)]">
              <div className="absolute -top-3 right-6 rounded-md bg-teal-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                Tiết kiệm 20%
              </div>
              <div>
                <h3 className="text-xl font-bold text-teal-400">Combo Powerpack</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold text-white">
                    {retailBilling === 'monthly' ? '599K' : '3.99M'}
                  </span>
                  <span className="ml-1 text-sm font-medium text-zinc-400">
                    {retailBilling === 'monthly' ? '/tháng' : '/vĩnh viễn'}
                  </span>
                </div>
                <ul className="mt-6 space-y-3 text-sm text-zinc-300 font-medium">
                  <li>🔥 Bao gồm <span className="text-white">Healing Bird Tool</span></li>
                  <li>🔥 Bao gồm <span className="text-white">Ban Content Tool</span></li>
                  <li>🔥 Cập nhật tính năng miễn phí</li>
                </ul>
              </div>
              <button className="mt-6 w-full rounded-xl bg-teal-600 py-2.5 text-sm font-bold text-white hover:bg-teal-500 transition shadow-lg shadow-teal-500/20">
                Sở hữu trọn bộ
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
