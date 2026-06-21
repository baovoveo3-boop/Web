"use client";

import React, { useRef, useEffect } from "react";

export default function ElasticCarousel({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let overscrollAmount = 0;

    const handleDown = (e: MouseEvent | TouchEvent) => {
      isDown = true;
      startX = e instanceof MouseEvent ? e.pageX - scrollEl.offsetLeft : e.touches[0].pageX - scrollEl.offsetLeft;
      scrollLeft = scrollEl.scrollLeft;
      overscrollAmount = 0;

      if (containerRef.current) {
        containerRef.current.style.transition = 'none';
      }
      scrollEl.style.scrollSnapType = 'none';
    };

    const handleLeave = () => {
      if (!isDown) return;
      handleUp();
    };

    const handleUp = () => {
      isDown = false;
      scrollEl.style.scrollSnapType = 'x mandatory';

      if (overscrollAmount !== 0 && containerRef.current) {
        containerRef.current.style.transition = 'transform 0.5s cubic-bezier(0.25, 1.5, 0.5, 1)';
        containerRef.current.style.transform = `translateX(0px)`;
        overscrollAmount = 0;
      }
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDown) return;
      
      const x = e instanceof MouseEvent ? e.pageX - scrollEl.offsetLeft : e.touches[0].pageX - scrollEl.offsetLeft;
      const walk = (x - startX) * 1.5; // Multiply for faster scrolling feel
      const predictedScroll = scrollLeft - walk;
      
      // Calculate max scroll precisely
      const maxScroll = scrollEl.scrollWidth - scrollEl.clientWidth;

      if (predictedScroll < 0) {
        if (e.cancelable) e.preventDefault();
        scrollEl.scrollLeft = 0;
        overscrollAmount = -predictedScroll * 0.4;
        if (containerRef.current) containerRef.current.style.transform = `translateX(${overscrollAmount}px)`;
      } else if (predictedScroll > maxScroll) {
        if (e.cancelable) e.preventDefault();
        scrollEl.scrollLeft = maxScroll;
        overscrollAmount = -(predictedScroll - maxScroll) * 0.4;
        if (containerRef.current) containerRef.current.style.transform = `translateX(${overscrollAmount}px)`;
      } else {
        scrollEl.scrollLeft = predictedScroll;
        if (containerRef.current) containerRef.current.style.transform = `translateX(0px)`;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      const maxScroll = scrollEl.scrollWidth - scrollEl.clientWidth;
      // Precision margin for zooming or fractional pixels
      const isAtLeft = scrollEl.scrollLeft <= 1; 
      const isAtRight = scrollEl.scrollLeft >= maxScroll - 2;

      if (isAtLeft && e.deltaX < 0) {
        if (containerRef.current) {
          containerRef.current.style.transition = 'transform 0.1s ease-out';
          containerRef.current.style.transform = `translateX(${Math.min(80, -e.deltaX * 0.6)}px)`;
        }
        clearTimeout((scrollEl as any).wheelTimeout);
        (scrollEl as any).wheelTimeout = setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.style.transition = 'transform 0.6s cubic-bezier(0.25, 1.5, 0.5, 1)';
            containerRef.current.style.transform = `translateX(0px)`;
          }
        }, 150);
      } 
      else if (isAtRight && e.deltaX > 0) {
        if (containerRef.current) {
          containerRef.current.style.transition = 'transform 0.1s ease-out';
          containerRef.current.style.transform = `translateX(${Math.max(-80, -e.deltaX * 0.6)}px)`;
        }
        clearTimeout((scrollEl as any).wheelTimeout);
        (scrollEl as any).wheelTimeout = setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.style.transition = 'transform 0.6s cubic-bezier(0.25, 1.5, 0.5, 1)';
            containerRef.current.style.transform = `translateX(0px)`;
          }
        }, 150);
      }
    };

    // Use native event listeners to allow preventDefault() inside passive context correctly
    scrollEl.addEventListener('mousedown', handleDown);
    scrollEl.addEventListener('mouseleave', handleLeave);
    window.addEventListener('mouseup', handleUp);
    scrollEl.addEventListener('mousemove', handleMove, { passive: false });

    scrollEl.addEventListener('touchstart', handleDown, { passive: false });
    window.addEventListener('touchend', handleUp);
    scrollEl.addEventListener('touchmove', handleMove, { passive: false });
    
    scrollEl.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      scrollEl.removeEventListener('mousedown', handleDown);
      scrollEl.removeEventListener('mouseleave', handleLeave);
      window.removeEventListener('mouseup', handleUp);
      scrollEl.removeEventListener('mousemove', handleMove);

      scrollEl.removeEventListener('touchstart', handleDown);
      window.removeEventListener('touchend', handleUp);
      scrollEl.removeEventListener('touchmove', handleMove);
      
      scrollEl.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="will-change-transform"
    >
      <div 
        ref={scrollRef}
        onDragStart={(e) => e.preventDefault()} // Ngăn trình duyệt tự động drag hình ảnh/link
        className={`flex overflow-x-auto snap-x snap-mandatory hide-scrollbar cursor-grab active:cursor-grabbing ${className}`}
        style={{ 
          overscrollBehaviorX: 'none',
          WebkitOverflowScrolling: 'touch',
          userSelect: 'none'
        }}
      >
        {children}
      </div>
    </div>
  );
}
