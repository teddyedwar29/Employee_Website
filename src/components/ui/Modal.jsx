// File: src/components/ui/Modal.jsx
import React, { useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const backdropRef = useRef(null);
  const popupRef = useRef(null);

  // Sync dengan isOpen + mainkan animasi in/out
  useEffect(() => {
    let timeoutId;

    if (isOpen) {
      // Modal diminta buka → render, hapus kelas animasi keluar
      setShouldRender(true);
      if (backdropRef.current) {
        backdropRef.current.classList.remove('modal-backdrop-out');
      }
      if (popupRef.current) {
        popupRef.current.classList.remove('modal-pop-out');
      }
    } else if (shouldRender) {
      // Modal diminta tutup → mainkan animasi keluar dulu
      if (backdropRef.current) {
        backdropRef.current.classList.add('modal-backdrop-out');
      }
      if (popupRef.current) {
        popupRef.current.classList.add('modal-pop-out');
      }
      timeoutId = setTimeout(() => {
        setShouldRender(false);
      }, 220); // harus sama dengan durasi animasi CSS
    }

    return () => clearTimeout(timeoutId);
  }, [isOpen, shouldRender]);

  if (!shouldRender) return null;

  const handleBackdropClick = (e) => {
    // Biar cuma klik di area gelap yang nutup
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    // Backdrop
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 modal-backdrop"
    >
      {/* Konten Modal */}
      <div
        ref={popupRef}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-full overflow-y-auto modal-pop"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer rounded-full p-1 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
