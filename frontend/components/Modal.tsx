'use client';

import React from 'react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export default function Modal({
  isOpen,
  title,
  onClose,
  children,
  size = 'md'
}: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'w-96',
    md: 'w-2/5',
    lg: 'w-3/5'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop - Shows blurred page content behind */}
      <div
        className="absolute inset-0 transition-opacity"
        style={{
          backdropFilter: 'blur(4px) brightness(0.95)',
          backgroundColor: 'rgba(0, 0, 0, 0.05)'
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative ${sizeClasses[size]} bg-white rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className="sticky top-0 flex justify-between items-center p-6 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
