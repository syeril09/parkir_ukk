'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

export default function SidebarPetugas() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin logout?')) {
      // Clear cookies
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      router.push('/login');
    }
  };

  const menuItems = [
    {
      icon: '📊',
      label: 'Dashboard',
      href: '/petugas/dashboard',
      active: pathname === '/petugas/dashboard'
    },
    {
      icon: '🚗',
      label: 'Transaksi Parkir',
      href: '/petugas/transaksi',
      active: pathname === '/petugas/transaksi'
    },
    {
      icon: '🧾',
      label: 'Cetak Struk',
      href: '/petugas/cetak-struk',
      active: pathname === '/petugas/cetak-struk'
    },
    {
      icon: '📋',
      label: 'History Transaksi',
      href: '/petugas/history',
      active: pathname === '/petugas/history'
    }
  ];

  return (
    <div
      className={`${
        isOpen ? 'w-64' : 'w-20'
      } bg-gradient-to-b from-sky-600 via-sky-700 to-cyan-800 text-white transition-all duration-300 flex flex-col h-screen shadow-xl`}
    >
      {/* Logo/Header */}
      <div className="p-4 border-b border-sky-400">
        <div className="flex items-center justify-between">
          {isOpen && (
            <div>
              <h1 className="text-xl font-bold text-white">🅿️ PARKIR</h1>
              <p className="text-xs text-sky-200 font-semibold">Petugas</p>
            </div>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-sky-500 rounded-lg transition"
          >
            {isOpen ? '◀' : '▶'}
          </button>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
              item.active
                ? 'bg-gradient-to-r from-white to-sky-100 text-sky-700 font-semibold shadow-lg'
                : 'text-sky-100 hover:bg-sky-500 hover:text-white'
            }`}
          >
            <span className="text-2xl">{item.icon}</span>
            {isOpen && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-sky-400">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg transition font-semibold shadow-lg"
        >
          <span className="text-xl">🚪</span>
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}
