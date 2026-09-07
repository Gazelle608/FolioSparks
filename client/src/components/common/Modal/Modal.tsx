import React, { useEffect, useRef } from 'react';
import { IconClose } from '../../../types/icons';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-900/50 backdrop-blur-sm animate-fadeIn">
      <div
        ref={modalRef}
        className={`
          ${sizes[size]}
          w-full mx-4 bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto
          animate-slideUp
        `}
      >
        <div className="sticky top-0 bg-white border-b border-primary-100 px-6 py-4 flex items-center justify-between z-10">
          {title && (
            <h3 className="text-xl font-serif text-primary-900">{title}</h3>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <IconClose size={24} color="#163832" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};