'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import SidebarOwner from '@/components/SidebarOwner';
import ProtectedLayout from '@/components/ProtectedLayout';
import { transaksiAPI } from '@/lib/api';
import Link from 'next/link';

interface User {
  id: number;
  nama: string;
  username: string;
  role: string;
  email: string;
}

interface DashboardStats {
  totalTransaksi: number;
  totalPendapatan: number;
  totalKendaraan: number;
  avgBiayaPerJam: number;
  transaksiTodayCount: number;
  transaksiTodayRevenue: number;
}

export default function OwnerDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalTransaksi: 0,
    totalPendapatan: 0,
    totalKendaraan: 0,
    avgBiayaPerJam: 0,
    transaksiTodayCount: 0,
    transaksiTodayRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Get user data from cookies
        const userStr = Cookies.get('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          setUser(userData);
          console.log('👤 Owner data loaded:', userData);
        }

        // Fetch transaction statistics
        const transaksiRes = await transaksiAPI.getAll();
        console.log('📊 Transaksi data:', transaksiRes);

        const allTransaksi = transaksiRes.data || [];

        // Calculate statistics
        const today = new Date().toISOString().split('T')[0];
        
        // Filter transaksi yang sudah selesai (ada waktu keluar dan total_bayar)
        const transaksiSelesai = allTransaksi.filter((t: any) => t.waktu_keluar && t.total_bayar);
        
        // Transaksi hari ini
        const transaksiHariIni = transaksiSelesai.filter((t: any) =>
          new Date(t.waktu_masuk).toISOString().split('T')[0] === today
        );

        // Calculate totals
        const totalPendapatan = transaksiSelesai.reduce((sum: number, t: any) => 
          sum + (parseInt(t.total_bayar) || 0), 0
        );

        const totalPendapatanHariIni = transaksiHariIni.reduce((sum: number, t: any) =>
          sum + (parseInt(t.total_bayar) || 0), 0
        );

        // Average biaya
        const avgBiaya = transaksiSelesai.length > 0 
          ? Math.round(totalPendapatan / transaksiSelesai.length)
          : 0;

        // Unique kendaraan
        const uniqueKendaraan = new Set(allTransaksi.map((t: any) => t.plat_nomor)).size;

        setStats({
          totalTransaksi: transaksiSelesai.length,
          totalPendapatan: totalPendapatan,
          totalKendaraan: uniqueKendaraan,
          avgBiayaPerJam: avgBiaya,
          transaksiTodayCount: transaksiHariIni.length,
          transaksiTodayRevenue: totalPendapatanHariIni
        });

        setLoading(false);
      } catch (err: any) {
        console.error('Dashboard Error:', err);
        setError(err.response?.data?.message || err.message || 'Gagal memuat data');
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <ProtectedLayout requiredRole="owner">
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <SidebarOwner />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-white shadow-md p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Owner</h1>
                <p className="text-gray-600 mt-1">Pantau dan analisis performa parkir Anda</p>
              </div>
              {user && (
                <div className="text-right">
                  <p className="text-sm text-gray-500">Logged in as</p>
                  <p className="text-lg font-semibold text-gray-900">{user.nama}</p>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {/* Welcome Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Selamat datang, {user?.nama}! 👋
              </h2>
              <p className="text-gray-600">
                Kelola dan monitor operasional parkir Anda dengan dashboard yang komprehensif
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                ⚠️ {error}
              </div>
            )}

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Transaksi */}
              <div className="bg-white rounded-lg shadow p-6 border-t-4 border-sky-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Transaksi</p>
                    <p className="text-4xl font-bold text-sky-600 mt-2">
                      {loading ? '-' : stats.totalTransaksi}
                    </p>
                  </div>
                  <div className="text-5xl">📊</div>
                </div>
              </div>

              {/* Total Pendapatan */}
              <div className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Pendapatan</p>
                    <p className="text-xl font-bold text-blue-600 mt-2">
                      {loading ? '-' : `Rp${stats.totalPendapatan.toLocaleString('id-ID')}`}
                    </p>
                  </div>
                  <div className="text-5xl ml-2">💰</div>
                </div>
              </div>

              {/* Total Kendaraan Unik */}
              <div className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Kendaraan Unik</p>
                    <p className="text-4xl font-bold text-blue-600 mt-2">
                      {loading ? '-' : stats.totalKendaraan}
                    </p>
                  </div>
                  <div className="text-5xl">🚗</div>
                </div>
              </div>

              {/* Rata-rata Biaya */}
              <div className="bg-white rounded-lg shadow p-6 border-t-4 border-sky-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Rata-rata Biaya</p>
                    <p className="text-xl font-bold text-sky-600 mt-2">
                      {loading ? '-' : `Rp${stats.avgBiayaPerJam.toLocaleString('id-ID')}`}
                    </p>
                  </div>
                  <div className="text-5xl ml-2">📈</div>
                </div>
              </div>
            </div>

            {/* Today Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Transaksi Hari Ini */}
              <div className="bg-gradient-to-br from-sky-500 to-cyan-600 rounded-lg shadow-lg p-8 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sky-100 text-sm font-medium">Transaksi Hari Ini</p>
                    <p className="text-4xl font-bold mt-2">{loading ? '-' : stats.transaksiTodayCount}</p>
                    <p className="text-sky-100 text-sm mt-2">transaksi</p>
                  </div>
                  <div className="text-6xl">📅</div>
                </div>
              </div>

              {/* Pendapatan Hari Ini */}
              <div className="bg-gradient-to-br from-blue-500 to-sky-600 rounded-lg shadow-lg p-8 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sky-100 text-sm font-medium">Pendapatan Hari Ini</p>
                    <p className="text-xl font-bold mt-2">
                      {loading ? '-' : `Rp${stats.transaksiTodayRevenue.toLocaleString('id-ID')}`}
                    </p>
                    <p className="text-sky-100 text-sm mt-2">revenue</p>
                  </div>
                  <div className="text-6xl ml-2">💵</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rekap Transaksi */}
              <Link href="/owner/rekap">
                <div className="bg-gradient-to-br from-sky-600 to-cyan-600 rounded-lg shadow-lg p-8 text-white cursor-pointer hover:shadow-xl transition transform hover:scale-105">
                  <div className="text-5xl mb-4">📈</div>
                  <h3 className="text-2xl font-bold mb-2">Rekap Transaksi</h3>
                  <p className="text-sky-100 mb-4">
                    Lihat laporan detail transaksi dengan filter tanggal
                  </p>
                  <div className="inline-block bg-white text-sky-600 px-4 py-2 rounded-lg font-semibold hover:bg-sky-50">
                    Lihat Rekap
                  </div>
                </div>
              </Link>

              {/* Statistik Tambahan */}
              <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-sky-500">
                <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Info Sistem</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Aplikasi</span>
                    <span className="font-semibold text-gray-900">Parkir v1.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Role</span>
                    <span className="font-semibold text-gray-900">Owner/Admin Area</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className="font-semibold text-blue-600">🟢 Online</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tanggal</span>
                    <span className="font-semibold text-gray-900">{new Date().toLocaleDateString('id-ID')}</span>
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
