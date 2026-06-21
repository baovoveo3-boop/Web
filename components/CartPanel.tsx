"use client";

import { useCart } from "@/app/context/CartContext";
import { X, Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import { useState } from "react";
import CheckoutModal from "./CheckoutModal";

export default function CartPanel() {
  const { isCartOpen, setIsCartOpen, cartItems, removeFromCart, totalAmount, clearCart } = useCart();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  if (!isCartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-[#0B0510]/80 backdrop-blur-sm z-[60] transition-opacity"
        onClick={() => setIsCartOpen(false)}
      ></div>

      {/* Slide-over panel */}
      <div className={`fixed inset-y-0 right-0 z-[70] w-full max-w-md bg-zinc-950 border-l border-zinc-800 shadow-2xl transform transition-transform duration-300 ease-in-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50 backdrop-blur-md">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-neonGreen" />
            Giỏ hàng của bạn
          </h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-4">
              <ShoppingCart className="w-16 h-16 opacity-20" />
              <p>Giỏ hàng đang trống.</p>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="mt-4 px-6 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            <>
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 relative group">
                  <div className="w-16 h-16 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 overflow-hidden">
                    {/* Placeholder for image or icon */}
                    <span className="text-2xl opacity-50">🎁</span>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="font-bold text-white text-sm line-clamp-2">{item.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-neonPurple font-bold text-sm">{item.priceText.split('/')[0]}</p>
                      {item.originalPriceText && (
                        <p className="text-xs text-zinc-500 line-through">{item.originalPriceText}</p>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="absolute top-2 right-2 p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition opacity-0 group-hover:opacity-100"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-zinc-800 p-6 bg-zinc-900/50 backdrop-blur-md">
            <div className="flex justify-between items-center mb-6">
              <span className="text-zinc-400">Tổng cộng</span>
              <span className="text-2xl font-bold text-white">{totalAmount.toLocaleString()}đ</span>
            </div>
            
            <button 
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-neonGreen to-emerald-500 hover:from-emerald-400 hover:to-neonGreen text-zinc-950 font-bold text-lg transition flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(52,211,153,0.3)]"
            >
              Thanh toán ngay <ArrowRight className="w-5 h-5" />
            </button>
            <div className="mt-4 text-center">
               <button onClick={clearCart} className="text-xs text-zinc-500 hover:text-zinc-300 underline">Xóa toàn bộ giỏ hàng</button>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Modal for Cart */}
      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        items={cartItems}
        onSuccess={() => {
          clearCart();
          setIsCheckoutOpen(false);
          setIsCartOpen(false);
        }}
      />
    </>
  );
}
