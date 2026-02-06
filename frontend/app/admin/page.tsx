'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import AdminSidebar from '@/components/AdminSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import ProtectedLayout from '@/components/ProtectedLayout';
import { areaParkirAPI, userAPI, kendaraanAPI } from '@/lib/api';

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

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalArea: 0,
    totalKendaraan: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Get user data
        const userStr = Cookies.get('user');
        if (userStr) {
          setUser(JSON.parse(userStr));
        }

        // Fetch statistics with error handling
        try {
          const [usersRes, areaRes, kendaraanRes] = await Promise.all([
            userAPI.getAll().catch(err => {
              console.warn('Failed to fetch users:', err.message);
              return { total: 0 };
            }),
            areaParkirAPI.getAll().catch(err => {
              console.warn('Failed to fetch areas:', err.message);
              return { total: 0 };
            }),
            kendaraanAPI.getAll().catch(err => {
              console.warn('Failed to fetch kendaraan:', err.message);
              return { total: 0 };
            })
          ]);

          setStats({
            totalUsers: usersRes?.data?.length || usersRes?.total || 0,
            totalArea: areaRes?.data?.length || areaRes?.total || 0,
            totalKendaraan: kendaraanRes?.data?.length || kendaraanRes?.total || 0
          });
        } catch (statsErr: any) {
          console.warn('Error fetching dashboard stats:', statsErr.message);
          // Set default stats if API fails
          setStats({
            totalUsers: 0,
            totalArea: 0,
            totalKendaraan: 0
          });
        }

        setLoading(false);
      } catch (err: any) {
        console.error('Dashboard Error:', err.message);
        setError(err.response?.data?.message || err.message || 'Gagal memuat data dashboard');
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <ProtectedLayout requiredRole="admin">
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <DashboardHeader title="Dashboard Admin" role="admin" />

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {/* Welcome Section */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Selamat datang, {user?.nama}! 👋
              </h2>
              <p className="text-gray-600">
                Kelola sistem parkir Anda dengan mudah
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Users Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total User</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {loading ? '-' : stats.totalUsers}
                    </p>
                  </div>
                  <div className="text-4xl">👥</div>
                </div>
              </div>

              {/* Total Area Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Area Parkir</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {loading ? '-' : stats.totalArea}
                    </p>
                  </div>
                  <div className="text-4xl">🅿️</div>
                </div>
              </div>

              {/* Total Kendaraan Card */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Kendaraan</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {loading ? '-' : stats.totalKendaraan}
                    </p>
                  </div>
                  <div className="text-4xl">🚗</div>
                </div>
              </div>

              {/* Total Transaksi Card */}
              {/* Transaksi stats removed per admin request */}
            </div>

            {/* Quick Actions */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Aksi Cepat</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => router.push('/admin/users')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition">
                    Tambah User
                  </button>
                  <button 
                    onClick={() => router.push('/admin/area')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition">
                    Tambah Area
                  </button>
                  {/* 'Lihat Laporan' removed (transaksi) */}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Menu Utama</h3>
                <div className="space-y-3 text-sm">
                  <a href="/admin/users" className="block text-blue-600 hover:text-blue-800">
                    → Manajemen User
                  </a>
                  <a href="/admin/area" className="block text-blue-600 hover:text-blue-800">
                    → Kelola Area Parkir
                  </a>
                  <a href="/admin/kendaraan" className="block text-blue-600 hover:text-blue-800">
                    → Daftar Kendaraan
                  </a>
                  {/* Lihat Transaksi link removed */}
                  <a href="/admin/log-aktivitas" className="block text-blue-600 hover:text-blue-800">
                    → Log Aktivitas
                  </a>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">ℹ️ Informasi</h3>
                <div className="text-sm text-gray-600 space-y-3">
                  <p>Aplikasi Parkir v1.0</p>
                  <p>Role: Admin</p>
                  <p>Status: 🟢 Online</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedLayout>
  );
}
