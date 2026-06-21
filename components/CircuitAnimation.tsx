"use client";

import React, { useEffect, useState } from 'react';

export default function CircuitAnimation() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Tạo ra các đốm sáng điện tử chạy ngẫu nhiên
  const particles = Array.from({ length: 20 }).map((_, i) => {
    const isHorizontal = Math.random() > 0.5;
    const top = `${Math.random() * 100}%`;
    const left = `${Math.random() * 100}%`;
    const duration = 3 + Math.random() * 4; // 3-7s
    const delay = Math.random() * 5;

    return (
      <div
        key={i}
        className={`absolute bg-neonBlue shadow-[0_0_10px_#06b6d4,0_0_20px_#06b6d4] rounded-full`}
        style={{
          top: isHorizontal ? top : '-10px',
          left: isHorizontal ? '-10px' : left,
          width: isHorizontal ? '15px' : '3px',
          height: isHorizontal ? '3px' : '15px',
          animation: isHorizontal 
            ? `flowRight ${duration}s linear ${delay}s infinite` 
            : `flowDown ${duration}s linear ${delay}s infinite`,
          opacity: 0.8,
        }}
      />
    );
  });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes flowRight {
          0% { transform: translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(100vw); opacity: 0; }
        }
        @keyframes flowDown {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
      `}} />
      {particles}
      
      {/* Lớp phủ màu gradient chìm để text dễ đọc hơn */}
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent"></div>
    </div>
  );
}
