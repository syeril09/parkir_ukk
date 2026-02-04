'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import SidebarPetugas from '@/components/SidebarPetugas';
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
  totalTransaksiHariIni: number;
  totalPendapatan: number;
  kendaraanAktif: number;
  transaksiProses: number;
}

export default function PetugasDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalTransaksiHariIni: 0,
    totalPendapatan: 0,
    kendaraanAktif: 0,
    transaksiProses: 0
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
          console.log('👤 User data loaded:', userData);
        }

        // Fetch transaction statistics
        const transaksiRes = await transaksiAPI.getAll();
        console.log('📊 Transaksi data:', transaksiRes);

        // Calculate statistics
        const today = new Date().toISOString().split('T')[0];
        const transaksiHariIni = transaksiRes.data?.filter((t: any) => 
          new Date(t.waktu_masuk).toISOString().split('T')[0] === today
        ) || [];

        // Total pendapatan hanya dari transaksi yang sudah selesai (ada waktu_keluar dan total_bayar)
        const totalPendapatan = transaksiHariIni.reduce((sum: number, t: any) => 
          sum + (t.waktu_keluar && t.total_bayar ? parseFloat(t.total_bayar) : 0), 0
        );

        const kendaraanAktif = transaksiRes.data?.filter((t: any) => !t.waktu_keluar).length || 0;
        const transaksiProses = kendaraanAktif;

        setStats({
          totalTransaksiHariIni: transaksiHariIni.length,
          totalPendapatan: totalPendapatan,
          kendaraanAktif: kendaraanAktif,
          transaksiProses: transaksiProses
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
    <ProtectedLayout requiredRole="petugas">
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <SidebarPetugas />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-white shadow-md p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Petugas</h1>
                <p className="text-gray-600 mt-1">Kelola transaksi parkir dengan mudah</p>
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
                Kelola transaksi parkir dan cetak struk dengan sistem terintegrasi
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                ⚠️ {error}
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Transaksi Hari Ini */}
              <div className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Transaksi Hari Ini</p>
                    <p className="text-4xl font-bold text-blue-600 mt-2">
                      {loading ? '-' : stats.totalTransaksiHariIni}
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
                    <p className="text-3xl font-bold text-blue-600 mt-2">
                      {loading ? '-' : `Rp${Math.round(stats.totalPendapatan).toLocaleString('id-ID')}`}
                    </p>
                  </div>
                  <div className="text-5xl">💰</div>
                </div>
              </div>

              {/* Kendaraan Aktif */}
              <div className="bg-white rounded-lg shadow p-6 border-t-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Kendaraan Aktif</p>
                    <p className="text-4xl font-bold text-yellow-600 mt-2">
                      {loading ? '-' : stats.kendaraanAktif}
                    </p>
                  </div>
                  <div className="text-5xl">🚗</div>
                </div>
              </div>

              {/* Transaksi Proses */}
              <div className="bg-white rounded-lg shadow p-6 border-t-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Proses Keluar</p>
                    <p className="text-4xl font-bold text-purple-600 mt-2">
                      {loading ? '-' : stats.transaksiProses}
                    </p>
                  </div>
                  <div className="text-5xl">⏳</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Transaksi Masuk */}
              <Link href="/petugas/transaksi?type=masuk">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-8 text-white cursor-pointer hover:shadow-xl transition transform hover:scale-105">
                  <div className="text-5xl mb-4">🚙</div>
                  <h3 className="text-2xl font-bold mb-2">Kendaraan Masuk</h3>
                  <p className="text-green-100 mb-4">
                    Input kendaraan yang baru masuk area parkir
                  </p>
                  <div className="inline-block bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50">
                    Input Masuk
                  </div>
                </div>
              </Link>

              {/* Transaksi Keluar */}
              <Link href="/petugas/transaksi?type=keluar">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-8 text-white cursor-pointer hover:shadow-xl transition transform hover:scale-105">
                  <div className="text-5xl mb-4">🚗</div>
                  <h3 className="text-2xl font-bold mb-2">Kendaraan Keluar</h3>
                  <p className="text-blue-100 mb-4">
                    Catat kendaraan yang meninggalkan area parkir
                  </p>
                  <div className="inline-block bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50">
                    Input Keluar
                  </div>
                </div>
              </Link>

              {/* Cetak Struk */}
              <Link href="/petugas/cetak-struk">
                <div className="bg-gradient-to-br from-sky-500 to-purple-600 rounded-lg shadow-lg p-8 text-white cursor-pointer hover:shadow-xl transition transform hover:scale-105">
                  <div className="text-5xl mb-4">🧾</div>
                  <h3 className="text-2xl font-bold mb-2">Cetak Struk</h3>
                  <p className="text-purple-100 mb-4">
                    Cetak struk pembayaran parkir kendaraan
                  </p>
                  <div className="inline-block bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50">
                    Cetak Struk
                  </div>
                </div>
              </Link>
            </div>

            {/* Info Section */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">ℹ️ Informasi Sistem</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
                <div>
                  <p className="font-medium">Aplikasi Parkir v1.0</p>
                  <p className="text-blue-600">Sistem Manajemen Parkir Terintegrasi</p>
                </div>
                <div>
                  <p className="font-medium">Role: Petugas Parkir</p>
                  <p className="text-blue-600">Status: 🟢 Online</p>
                </div>
                <div>
                  <p className="font-medium">Jam Operasional</p>
                  <p className="text-blue-600">24 Jam Non-Stop</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedLayout>
  );
}
