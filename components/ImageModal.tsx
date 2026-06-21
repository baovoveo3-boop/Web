"use client";

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  altText: string;
}

export default function ImageModal({ isOpen, onClose, imageSrc, altText }: ImageModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-8 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-zinc-900/80 text-white hover:bg-neonPurple hover:text-white transition z-[101]"
      >
        <X className="w-6 h-6" />
      </button>
      
      <div 
        className="relative max-w-6xl w-full max-h-[90vh] flex items-center justify-center animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()} // Prevent clicking image from closing
      >
        <img 
          src={imageSrc} 
          alt={altText} 
          className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl border border-zinc-800"
        />
      </div>
    </div>
  );
}
