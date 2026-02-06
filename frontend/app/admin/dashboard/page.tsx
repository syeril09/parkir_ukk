'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import SidebarAdmin from '@/components/SidebarAdmin';
import DashboardHeader from '@/components/DashboardHeader';
import ProtectedLayout from '@/components/ProtectedLayout';
import { userAPI, areaParkirAPI, kendaraanAPI } from '@/lib/api';

interface User {
  id: number;
  nama: string;
  username: string;
  role: string;
  email: string;
}

interface DashboardStats {
  totalUsers: number;
  totalArea: number;
  totalKendaraan: number;
}

interface RecentActivity {
  id: number;
  action: string;
  timestamp: string;
  user: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalArea: 0,
    totalKendaraan: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Get user from cookie
        let userData: any = null;
        const userStr = Cookies.get('user');
        if (userStr) {
          userData = JSON.parse(userStr);
          if (userData.role !== 'admin') {
            router.push('/login');
            return;
          }
          setUser(userData);
        }

        // Fetch all statistics
        try {
          const [usersRes, areaRes, kendaraanRes] = await Promise.all([
            userAPI.getAll(),
            areaParkirAPI.getAll(),
            kendaraanAPI.getAll()
          ]);

          setStats({
            totalUsers: usersRes.data?.length || 0,
            totalArea: areaRes.data?.length || 0,
            totalKendaraan: kendaraanRes.data?.length || 0
          });
        } catch (apiError: any) {
          console.error('API Error:', apiError.message);
          setError(`Gagal memuat statistik: ${apiError.response?.status === 404 ? 'Backend API tidak ditemukan. Pastikan server backend berjalan di http://localhost:5000' : apiError.message}`);
        }

        // Simulated recent activity (would be fetched from API in production)
        setRecentActivity([
          { id: 1, action: 'User login', timestamp: new Date().toLocaleTimeString(), user: userData?.nama || 'Admin' },
          { id: 2, action: 'Dashboard accessed', timestamp: new Date().toLocaleTimeString(), user: userData?.nama || 'Admin' }
        ]);

        setLoading(false);
      } catch (err: any) {
        console.error('Dashboard Error:', err);
        const errorMsg = err.response?.status === 404 
          ? '❌ Backend API tidak ditemukan. Pastikan server backend berjalan di http://localhost:5000'
          : err.message || 'Gagal memuat data dashboard';
        setError(errorMsg);
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600 font-semibold">Memuat Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedLayout requiredRole="admin">
      <div className="flex">
        {/* Sidebar */}
        <SidebarAdmin />

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <DashboardHeader title="Dashboard Admin" role="admin" />

          {/* Content */}
          <main className="p-8 bg-gray-50 min-h-screen">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                👋 Selamat datang, {user?.nama}!
              </h1>
              <p className="text-gray-600 text-lg">
                Kelola sistem parkir Anda dengan mudah dan efisien
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg">
                <p className="font-semibold">⚠️ Error</p>
                <p>{error}</p>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Total Users Card */}
              <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total User</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats.totalUsers}
                    </p>
                  </div>
                  <div className="text-5xl opacity-20">👥</div>
                </div>
              </div>

              {/* Total Area Card */}
              <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Area Parkir</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats.totalArea}
                    </p>
                  </div>
                  <div className="text-5xl opacity-20">🅿️</div>
                </div>
              </div>

              {/* Total Kendaraan Card */}
              <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6 border-l-4 border-sky-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Kendaraan</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats.totalKendaraan}
                    </p>
                  </div>
                  <div className="text-5xl opacity-20">🚗</div>
                </div>
              </div>
              {/* removed Transaksi & Revenue cards per requested admin cleanup */}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Quick Actions */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">⚡ Menu Utama</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* User Management */}
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200 hover:shadow-md transition cursor-pointer">
                    <div className="text-4xl mb-3">👥</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Manajemen User</h3>
                    <p className="text-sm text-gray-600 mb-4">Kelola user, admin, petugas, dan owner</p>
                    <a href="/admin/users" className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium">
                      Kelola →
                    </a>
                  </div>

                  {/* Tarif Parkir */}
                  <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-2 border-green-200 hover:shadow-md transition cursor-pointer">
                    <div className="text-4xl mb-3">💰</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Tarif Parkir</h3>
                    <p className="text-sm text-gray-600 mb-4">Atur tarif parkir untuk setiap jenis kendaraan</p>
                    <a href="/admin/tarif" className="inline-block px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium">
                      Kelola →
                    </a>
                  </div>

                  {/* Area Parkir */}
                  <div className="p-6 bg-gradient-to-br from-sky-50 to-sky-100 rounded-lg border-2 border-sky-200 hover:shadow-md transition cursor-pointer">
                    <div className="text-4xl mb-3">🅿️</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Area Parkir</h3>
                    <p className="text-sm text-gray-600 mb-4">Buat dan kelola area parkir baru</p>
                    <a href="/admin/area" className="inline-block px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition font-medium">
                      Kelola →
                    </a>
                  </div>

                  {/* Kendaraan */}
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200 hover:shadow-md transition cursor-pointer">
                    <div className="text-4xl mb-3">🚗</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Daftar Kendaraan</h3>
                    <p className="text-sm text-gray-600 mb-4">Lihat semua kendaraan yang terdaftar</p>
                    <a href="/admin/kendaraan" className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium">
                      Lihat →
                    </a>
                  </div>

                  {/* Log Aktivitas */}
                  <div className="p-6 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg border-2 border-cyan-200 hover:shadow-md transition cursor-pointer md:col-span-2">
                    <div className="text-4xl mb-3">📋</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Log Aktivitas User</h3>
                    <p className="text-sm text-gray-600 mb-4">Pantau semua aktivitas user di sistem</p>
                    <a href="/admin/logs" className="inline-block px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition font-medium">
                      Lihat →
                    </a>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Aktivitas Terbaru</h2>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity) => (
                      <div key={activity.id} className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-900">{activity.action}</p>
                            <p className="text-sm text-gray-600">{activity.user}</p>
                          </div>
                          <span className="text-xs text-gray-500">{activity.timestamp}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 text-center py-4">Tidak ada aktivitas</p>
                  )}
                </div>

                {/* System Info */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">ℹ️ Informasi Sistem</h3>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Aplikasi:</span>
                      <span className="font-medium">Parkir v1.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Role:</span>
                      <span className="font-medium text-blue-600">{user?.role?.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="font-medium text-blue-600">🟢 Online</span>
                    </div>
                  </div>
                </div>

                {/* New Features Info */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">✨ Fitur Terbaru</h3>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-sky-50 border-l-4 border-sky-500 rounded">
                      <p className="font-medium text-sky-900">⚠️ Alert Parkir Lama</p>
                      <p className="text-sky-700 text-xs">Kendaraan yang parkir > 8 jam ditandai dengan highlight kuning</p>
                    </div>
                    <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                      <p className="font-medium text-blue-900">💰 Estimasi Biaya Real-time</p>
                      <p className="text-blue-700 text-xs">Sistem otomatis menghitung biaya saat kendaraan keluar</p>
                    </div>
                    <div className="p-3 bg-sky-50 border-l-4 border-sky-500 rounded">
                      <p className="font-medium text-sky-900">📊 Dashboard Analytics</p>
                      <p className="text-sky-700 text-xs">Pantau statistik real-time untuk setiap role pengguna</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedLayout>
  );
}
