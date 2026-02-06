'use client';

import Link from 'next/link';

/**
 * Component sidebar untuk admin dashboard
 */
export default function AdminSidebar() {
  const menuItems = [
    { name: 'Dashboard', icon: '📊', href: '/admin' },
    { name: 'User Management', icon: '👥', href: '/admin/users' },
    { name: 'Area Parkir', icon: '🅿️', href: '/admin/area' },
    { name: 'Kendaraan', icon: '🚗', href: '/admin/kendaraan' },
    // Transaksi removed for admin role
    { name: 'Log Aktivitas', icon: '📝', href: '/admin/log-aktivitas' }
  ];

  return (
    <aside className="w-64 bg-gradient-to-b from-blue-700 to-blue-800 text-white h-screen shadow-lg">
      <div className="p-6 border-b border-blue-600">
        <h2 className="text-2xl font-bold">
          <span className="text-2xl">🅿️</span>
          <span className="bg-gradient-to-r from-blue-200 to-blue-100 bg-clip-text text-transparent ml-1 inline-block"> PARKIR ADMIN</span>
        </h2>
      </div>

      <nav className="mt-6">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className="flex items-center px-6 py-3 hover:bg-blue-600 transition text-blue-100 hover:text-white border-l-4 border-transparent hover:border-blue-400"
          >
            <span className="mr-3 text-xl">{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
