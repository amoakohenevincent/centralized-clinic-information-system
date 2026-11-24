import React, { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-none animate-fadeIn">
      <div
        className={`bg-white rounded-none shadow-2xl border border-[#e5e5e3] w-full ${maxWidth} max-h-[90vh] flex flex-col overflow-hidden animate-scaleUp`}
      >
        <div className="px-6 py-4 border-b border-[#e9e9e7] flex items-center justify-between bg-[#faf9f6]">
          <h3 className="font-serif text-lg font-bold text-[#191919]">{title}</h3>
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs font-mono font-medium rounded-none text-[#787774] hover:text-[#191919] hover:bg-[#efefee] border border-[#e5e5e3] transition-colors"
          >
            ✕ Close
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

export { Modal };
export default Modal;

