"use client";

import { X, Wallet, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { CartItem } from "@/app/context/CartContext";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onSuccess?: () => void;
}

export default function CheckoutModal({ isOpen, onClose, items, onSuccess }: CheckoutModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { user, userData } = useAuth();
  
  // Real balance from Firebase
  const walletBalance = userData?.walletBalance || 0; 

  const totalAmount = items.reduce((sum, item) => {
    const num = item.priceText.split('/')[0].replace(/[^0-9]/g, '');
    return sum + (parseInt(num) || 0);
  }, 0);

  const hasEnoughBalance = walletBalance >= totalAmount;

  if (!isOpen) return null;

  const handleCheckout = async () => {
    if (!hasEnoughBalance || !user) return;
    
    setIsProcessing(true);
    
    try {
      const res = await fetch('/api/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          items: items,
          totalAmount: totalAmount
        })
      });

      const data = await res.json();

      if (data.success) {
        setIsSuccess(true);
        if (onSuccess) {
          setTimeout(onSuccess, 1500);
        }
      } else {
        alert(data.error || 'Có lỗi xảy ra khi thanh toán');
      }
    } catch (error) {
      console.error(error);
      alert('Không thể kết nối đến máy chủ thanh toán');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-[#0B0510]/90 backdrop-blur-md transition-opacity" 
        onClick={!isProcessing ? onClose : undefined}
      ></div>
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-gradient-to-br from-[#1A1025] to-[#0B0510] border border-zinc-800 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {isSuccess ? (
          <div className="p-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Thanh toán thành công!</h3>
            <p className="text-zinc-400 mb-6">Sản phẩm đã được thêm vào Hub của bạn.</p>
            <button onClick={onClose} className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition">
              Đóng
            </button>
          </div>
        ) : (
          <>
            <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-[#1A1025]/50">
              <h3 className="text-lg font-bold text-white">Xác nhận thanh toán</h3>
              <button onClick={!isProcessing ? onClose : undefined} className="text-zinc-500 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="bg-zinc-900/50 rounded-xl p-4 mb-6 border border-zinc-800/50">
                <h4 className="text-sm font-medium text-zinc-400 mb-3 uppercase tracking-wider">Đơn hàng của bạn ({items.length} món)</h4>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-zinc-200 text-sm line-clamp-1">{item.name}</span>
                      <span className="text-white font-medium shrink-0 ml-4">{item.priceText.split('/')[0]}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-zinc-800 mt-4 pt-4 flex justify-between items-center">
                  <span className="font-bold text-zinc-300">Tổng cộng:</span>
                  <span className="text-xl font-bold text-neonGreen">{totalAmount.toLocaleString()}đ</span>
                </div>
              </div>

              <div className="bg-zinc-900/50 rounded-xl p-4 mb-6 border border-zinc-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-4 h-4 text-zinc-400" />
                  <span className="text-sm font-medium text-zinc-400">Số dư ví của bạn:</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className={`text-2xl font-bold ${hasEnoughBalance ? 'text-white' : 'text-red-400'}`}>
                    {walletBalance.toLocaleString()}đ
                  </span>
                  {!hasEnoughBalance && (
                    <Link href="/hub?tab=wallet" className="text-xs text-red-400 underline hover:text-red-300">
                      Nạp thêm ngay
                    </Link>
                  )}
                </div>
              </div>

              {!hasEnoughBalance && (
                <div className="flex items-start gap-2 text-red-400 text-xs mb-6 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>Số dư của bạn không đủ để thực hiện giao dịch này. Vui lòng nạp thêm tiền vào ví.</p>
                </div>
              )}

              <button 
                onClick={handleCheckout}
                disabled={!hasEnoughBalance || isProcessing}
                className={`w-full py-3.5 rounded-xl font-bold text-base transition flex items-center justify-center gap-2
                  ${!hasEnoughBalance 
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-neonPurple to-neonPurple-dark hover:from-purple-500 hover:to-neonPurple text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                  }`}
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Đang xử lý...
                  </span>
                ) : (
                  <>Xác nhận thanh toán <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
