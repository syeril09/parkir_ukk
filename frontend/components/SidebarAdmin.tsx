'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { useState } from 'react';

export default function SidebarAdmin() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    router.push('/login');
  };

  const menuItems = [
    {
      label: '🏠 Dashboard',
      href: '/admin/dashboard',
      icon: '📊'
    },
    {
      label: '👥 Manajemen User',
      href: '/admin/users',
      icon: '👤'
    },
    {
      label: '💰 Tarif Parkir',
      href: '/admin/tarif',
      icon: '💵'
    },
    {
      label: '🅿️ Area Parkir',
      href: '/admin/area',
      icon: '📍'
    },
    {
      label: '🚗 Kendaraan',
      href: '/admin/kendaraan',
      icon: '🚙'
    },
    {
      label: '📋 Log Aktivitas',
      href: '/admin/logs',
      icon: '📝'
    }
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Sidebar Desktop */}
      <aside className={`${isOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-sky-600 via-sky-700 to-cyan-800 text-white h-screen fixed left-0 top-0 transition-all duration-300 overflow-y-auto shadow-xl z-40`}>
        {/* Logo Section */}
        <div className="p-6 border-b border-sky-500 flex items-center justify-between">
          {isOpen && (
            <div className="flex items-center gap-2">
              <div className="text-3xl">🅿️</div>
              <span className="text-xl font-bold text-white">PARKIR</span>
            </div>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-sky-500 rounded-lg transition"
          >
            {isOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg transition ${
                isActive(item.href)
                  ? 'bg-gradient-to-r from-sky-500 to-cyan-500 shadow-lg font-semibold'
                  : 'text-sky-100 hover:bg-sky-500 hover:text-white'
              }`}
              title={item.label}
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              {isOpen && <span className="font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sky-500">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg transition font-semibold shadow-lg"
            title="Logout"
          >
            <span className="text-xl flex-shrink-0">🚪</span>
            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Spacer for Desktop */}
      <div className={`${isOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}></div>
    </>
  );
}
