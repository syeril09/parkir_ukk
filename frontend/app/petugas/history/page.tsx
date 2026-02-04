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
}

interface Transaksi {
  id: number;
  plat_nomor: string;
  waktu_masuk: string;
  waktu_keluar?: string;
  biaya_parkir?: number;
  status: string;
}

export default function HistoryTransaksiPage() {
  const [user, setUser] = useState<User | null>(null);
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('semua');
  const [searchPlat, setSearchPlat] = useState('');

  useEffect(() => {
    // Get user data
    const userStr = Cookies.get('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }

    // Load semua transaksi
    loadAllTransaksi();
  }, []);

  const loadAllTransaksi = async () => {
    try {
      const res = await transaksiAPI.getAll();
      setTransaksiList(res.data || []);
      setLoading(false);
    } catch (err: any) {
      console.error('Error loading transaksi:', err);
      setError('Gagal memuat data transaksi');
      setLoading(false);
    }
  };

  const parseDate = (tanggal: string | null | undefined) => {
    if (!tanggal) return null;
    
    let date = new Date(tanggal);
    
    if (isNaN(date.getTime())) {
      const normalizedDate = String(tanggal).replace(/-/g, '/');
      date = new Date(normalizedDate);
    }
    
    if (isNaN(date.getTime())) {
      console.warn('parseDate: Invalid date:', tanggal);
      return null;
    }
    
    return date;
  };

  const formatTanggal = (tanggal: string) => {
    const date = parseDate(tanggal);
    if (!date) return 'Invalid Date';
    
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const hitungDurasi = (masuk: string, keluar?: string) => {
    if (!keluar) return '-';
    const waktuMasuk = new Date(masuk);
    const waktuKeluar = new Date(keluar);
    const durasiMenit = Math.ceil((waktuKeluar.getTime() - waktuMasuk.getTime()) / (1000 * 60));
    const jam = Math.floor(durasiMenit / 60);
    const menit = durasiMenit % 60;
    return `${jam}j ${menit}m`;
  };

  const getStatusBadge = (waktuKeluar?: string) => {
    if (waktuKeluar) {
      return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">✅ Selesai</span>;
    }
    return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">⏳ Aktif</span>;
  };

  const filteredTransaksi = transaksiList.filter((t) => {
    const matchPlat = t.plat_nomor.includes(searchPlat.toUpperCase());
    if (filterStatus === 'aktif') return matchPlat && !t.waktu_keluar;
    if (filterStatus === 'selesai') return matchPlat && t.waktu_keluar;
    return matchPlat;
  });

  const totalBiayaHariIni = filteredTransaksi
    .filter((t) => {
      const today = new Date().toISOString().split('T')[0];
      return new Date(t.waktu_masuk).toISOString().split('T')[0] === today;
    })
    .reduce((sum, t) => sum + (t.biaya_parkir || 0), 0);

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
                <h1 className="text-3xl font-bold text-gray-900">📋 History Transaksi</h1>
                <p className="text-gray-600 mt-1">Riwayat semua transaksi parkir</p>
              </div>
              <Link href="/petugas/dashboard">
                <button className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium transition">
                  ← Kembali
                </button>
              </Link>
            </div>
          </div>

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                <p className="text-gray-600 text-sm">Total Transaksi</p>
                <p className="text-2xl font-bold text-blue-600">{transaksiList.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
                <p className="text-gray-600 text-sm">Transaksi Aktif</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {transaksiList.filter((t) => !t.waktu_keluar).length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                <p className="text-gray-600 text-sm">Pendapatan Hari Ini</p>
                <p className="text-2xl font-bold text-blue-600">
                  Rp {totalBiayaHariIni.toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search Plat */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cari Plat Nomor</label>
                  <input
                    type="text"
                    placeholder="Contoh: BK 1234"
                    value={searchPlat}
                    onChange={(e) => setSearchPlat(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg text-slate-900 font-semibold placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>

                {/* Filter Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="semua">Semua Status</option>
                    <option value="aktif">Aktif</option>
                    <option value="selesai">Selesai</option>
                  </select>
                </div>

                {/* Results Count */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hasil</label>
                  <div className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 font-semibold">
                    {filteredTransaksi.length} transaksi ditemukan
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Memuat data...</p>
                </div>
              ) : filteredTransaksi.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Plat Nomor</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Waktu Masuk</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Waktu Keluar</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700">Durasi</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700">Biaya</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredTransaksi.reverse().map((transaksi) => (
                        <tr key={transaksi.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-bold text-gray-900">{transaksi.plat_nomor}</td>
                          <td className="px-4 py-3 text-gray-600 text-xs">
                            {formatTanggal(transaksi.waktu_masuk)}
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-xs">
                            {transaksi.waktu_keluar ? formatTanggal(transaksi.waktu_keluar) : '-'}
                          </td>
                          <td className="px-4 py-3 text-center text-gray-600">
                            {hitungDurasi(transaksi.waktu_masuk, transaksi.waktu_keluar)}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-900">
                            {transaksi.biaya_parkir ? `Rp ${transaksi.biaya_parkir.toLocaleString('id-ID')}` : '-'}
                          </td>
                          <td className="px-4 py-3 text-center">{getStatusBadge(transaksi.waktu_keluar)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-lg">Tidak ada transaksi yang sesuai dengan filter</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedLayout>
  );
}
