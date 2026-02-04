'use client';

import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import ProtectedLayout from '@/components/ProtectedLayout';
import { transaksiAPI } from '@/lib/api';

interface Transaksi {
  id: number;
  kendaraan_id: number;
  area_parkir_id: number;
  petugas_masuk_id: number;
  plat_nomor: string;
  nama_jenis: string;
  nama_area: string;
  petugas_masuk_nama: string;
  petugas_keluar_nama?: string;
  waktu_masuk: string;
  waktu_keluar: string | null;
  durasi_jam: number | null;
  tarif_per_jam: number;
  total_bayar: number | null;
  status: 'parkir' | 'selesai';
}

export default function LihatTransaksiPage() {
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('semua');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTransaksi();
  }, []);

  const loadTransaksi = async () => {
    try {
      setLoading(true);
      const response = await transaksiAPI.getAll();
      setTransaksi(response.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memuat transaksi');
    } finally {
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

  const formatTanggal = (date: string) => {
    const parsedDate = parseDate(date);
    if (!parsedDate) return 'Invalid Date';
    
    return parsedDate.toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const hitungDurasi = (masuk: string, keluar: string | null) => {
    if (!keluar) return '-';
    const start = new Date(masuk).getTime();
    const end = new Date(keluar).getTime();
    const diff = Math.floor((end - start) / 1000 / 60);
    const jam = Math.floor(diff / 60);
    const menit = diff % 60;
    return `${jam}j ${menit}m`;
  };

  const filteredTransaksi = transaksi.filter((t) => {
    const matchSearch =
      t.plat_nomor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter =
      filter === 'semua' ||
      (filter === 'aktif' && t.status === 'parkir') ||
      (filter === 'selesai' && t.status === 'selesai');
    return matchSearch && matchFilter;
  });

  const stats = {
    total: transaksi.length,
    aktif: transaksi.filter((t) => !t.waktu_keluar).length,
    selesai: transaksi.filter((t) => t.waktu_keluar).length,
    totalPendapatan: transaksi
      .filter((t) => t.waktu_keluar && t.total_bayar)
      .reduce((sum, t) => sum + (parseFloat(t.total_bayar) || 0), 0)
  };

  return (
    <ProtectedLayout requiredRole="admin">
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader title="Laporan Transaksi" role="admin" />
          <main className="flex-1 overflow-y-auto p-6">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Laporan Transaksi Parkir
              </h1>
              <div className="flex gap-4 flex-wrap">
                <input
                  type="text"
                  placeholder="Cari berdasarkan plat nomor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 border-2 border-blue-300 rounded-lg text-slate-900 font-semibold placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 border-2 border-blue-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="semua">Semua Transaksi</option>
                  <option value="aktif">Aktif (Belum Keluar)</option>
                  <option value="selesai">Selesai (Sudah Keluar)</option>
                </select>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-gray-600 text-sm">Total Transaksi</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-gray-600 text-sm">Kendaraan Aktif</p>
                <p className="text-3xl font-bold text-blue-600">{stats.aktif}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-gray-600 text-sm">Transaksi Selesai</p>
                <p className="text-3xl font-bold text-blue-600">{stats.selesai}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-gray-600 text-sm">Total Pendapatan</p>
                <p className="text-3xl font-bold text-sky-600">
                  Rp {Math.round(stats.totalPendapatan).toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            {/* Transaksi Table */}
            {loading ? (
              <div className="text-center py-10">
                <p className="text-gray-600">Memuat data...</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                        Plat Nomor
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                        Jenis
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                        Area
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                        Waktu Masuk
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                        Waktu Keluar
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                        Durasi
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                        Tarif/Jam
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                        Total Bayar
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredTransaksi.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {t.plat_nomor}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {t.nama_jenis}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {t.nama_area}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatTanggal(t.waktu_masuk)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {t.waktu_keluar ? formatTanggal(t.waktu_keluar) : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {hitungDurasi(t.waktu_masuk, t.waktu_keluar)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          Rp {t.tarif_per_jam.toLocaleString('id-ID')}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-sky-600">
                          {t.total_bayar ? `Rp ${t.total_bayar.toLocaleString('id-ID')}` : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              t.status === 'selesai'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {t.status === 'selesai' ? 'Selesai' : 'Aktif'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredTransaksi.length === 0 && (
                  <div className="text-center py-10 text-gray-600">
                    Tidak ada transaksi
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </ProtectedLayout>
  );
}
