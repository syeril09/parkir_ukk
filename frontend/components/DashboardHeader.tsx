'use client';

import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

/**
 * Component header untuk dashboard
 */
export default function DashboardHeader({ title, role }: { title: string; role: string }) {
  const router = useRouter();

  const handleLogout = () => {
    // Hapus cookies
    Cookies.remove('token');
    Cookies.remove('user');

    // Redirect ke login
    router.push('/login');
  };

  return (
    <header className="bg-gradient-to-r from-slate-50 to-slate-100 shadow-md border-b-4 border-sky-600">
      <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">{title}</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1 font-semibold">📍 Role: <span className="text-sky-700">{role.toUpperCase()}</span></p>
        </div>

        <button
          onClick={handleLogout}
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2 rounded-lg transition font-semibold shadow-lg"
        >
          🚪 Logout
        </button>
      </div>
    </header>
  );
}
