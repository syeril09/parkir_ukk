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
}

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

interface RekapData {
  transaksi: Transaksi[];
  totalTransaksi: number;
  totalPendapatan: number;
  transaksiPerArea: Record<string, number>;
  transaksiPerJam: Record<string, number>;
}

export default function RekapTransaksiPage() {
  const [user, setUser] = useState<User | null>(null);
  const [allTransaksi, setAllTransaksi] = useState<Transaksi[]>([]);
  const [filteredTransaksi, setFilteredTransaksi] = useState<Transaksi[]>([]);
  
  const [tanggalAwal, setTanggalAwal] = useState('');
  const [tanggalAkhir, setTanggalAkhir] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterApplied, setFilterApplied] = useState(false);

  useEffect(() => {
    // Get user data
    const userStr = Cookies.get('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }

    // Load semua transaksi
    loadAllTransaksi();

    // Set default tanggal (30 hari terakhir)
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    setTanggalAwal(thirtyDaysAgo.toISOString().split('T')[0]);
    setTanggalAkhir(today.toISOString().split('T')[0]);
  }, []);

  const loadAllTransaksi = async () => {
    try {
      const res = await transaksiAPI.getAll();
      // Filter hanya transaksi yang sudah selesai (memiliki waktu_keluar dan total_bayar)
      const transaksiSelesai = res.data?.filter((t: any) => t.waktu_keluar && t.total_bayar) || [];
      setAllTransaksi(transaksiSelesai);
      setFilteredTransaksi(transaksiSelesai);
      setLoading(false);
    } catch (err: any) {
      console.error('Error loading transaksi:', err);
      setError('Gagal memuat data transaksi');
      setLoading(false);
    }
  };

  const handleApplyFilter = () => {
    if (!tanggalAwal || !tanggalAkhir) {
      setError('Silakan pilih tanggal awal dan akhir');
      return;
    }

    if (new Date(tanggalAwal) > new Date(tanggalAkhir)) {
      setError('Tanggal awal tidak boleh lebih besar dari tanggal akhir');
      return;
    }

    const awal = new Date(tanggalAwal);
    const akhir = new Date(tanggalAkhir);
    akhir.setHours(23, 59, 59, 999); // Include full end date

    const filtered = allTransaksi.filter((t) => {
      const tanggalTransaksi = new Date(t.waktu_masuk);
      return tanggalTransaksi >= awal && tanggalTransaksi <= akhir;
    });

    setFilteredTransaksi(filtered);
    setFilterApplied(true);
    setError('');
  };

  const handleResetFilter = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    setTanggalAwal(thirtyDaysAgo.toISOString().split('T')[0]);
    setTanggalAkhir(today.toISOString().split('T')[0]);
    setFilteredTransaksi(allTransaksi);
    setFilterApplied(false);
    setError('');
  };

  const calculateStats = () => {
    const totalTransaksi = filteredTransaksi.length;
    const totalPendapatan = filteredTransaksi.reduce((sum, t) => sum + (parseInt(t.total_bayar as any) || 0), 0);
    const avgPendapatan = totalTransaksi > 0 ? Math.round(totalPendapatan / totalTransaksi) : 0;

    return { totalTransaksi, totalPendapatan, avgPendapatan };
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

  const hitungDurasi = (masuk: string, keluar: string) => {
    const waktuMasuk = new Date(masuk);
    const waktuKeluar = new Date(keluar);
    const durasiMenit = Math.ceil((waktuKeluar.getTime() - waktuMasuk.getTime()) / (1000 * 60));
    const jam = Math.floor(durasiMenit / 60);
    const menit = durasiMenit % 60;
    return `${jam}j ${menit}m`;
  };

  const handleExportCSV = () => {
    const headers = ['Plat Nomor', 'Jenis', 'Area', 'Waktu Masuk', 'Waktu Keluar', 'Durasi', 'Tarif/Jam', 'Total Bayar'];
    const rows = filteredTransaksi.map((t) => [
      t.plat_nomor,
      t.nama_jenis,
      t.nama_area,
      formatTanggal(t.waktu_masuk),
      formatTanggal(t.waktu_keluar || ''),
      hitungDurasi(t.waktu_masuk, t.waktu_keluar || ''),
      t.tarif_per_jam,
      parseInt(t.total_bayar as any) || 0
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rekap-transaksi-${tanggalAwal}-${tanggalAkhir}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stats = calculateStats();

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
                <h1 className="text-3xl font-bold text-gray-900">📈 Rekap Transaksi</h1>
                <p className="text-gray-600 mt-1">Laporan detail transaksi parkir dengan filter tanggal</p>
              </div>
              <Link href="/owner/dashboard">
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
                ⚠️ {error}
              </div>
            )}

            {/* Filter Section */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">🔍 Filter Transaksi</h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Tanggal Awal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Awal</label>
                  <input
                    type="date"
                    value={tanggalAwal}
                    onChange={(e) => setTanggalAwal(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-indigo-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-sky-500 bg-white"
                  />
                </div>

                {/* Tanggal Akhir */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Akhir</label>
                  <input
                    type="date"
                    value={tanggalAkhir}
                    onChange={(e) => setTanggalAkhir(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-indigo-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-sky-500 bg-white"
                  />
                </div>

                {/* Buttons */}
                <div className="flex items-end gap-2">
                  <button
                    onClick={handleApplyFilter}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition"
                  >
                    ✅ Apply Filter
                  </button>
                </div>

                {/* Reset Button */}
                <div className="flex items-end gap-2">
                  <button
                    onClick={handleResetFilter}
                    className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-medium py-2 px-4 rounded-lg transition"
                  >
                    🔄 Reset
                  </button>
                </div>
              </div>

              {/* Filter Info */}
              {filterApplied && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    📅 Filter aktif: <strong>{tanggalAwal}</strong> hingga <strong>{tanggalAkhir}</strong>
                  </p>
                </div>
              )}
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Total Transaksi */}
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-sky-500">
                <p className="text-gray-600 text-sm font-medium">Total Transaksi</p>
                <p className="text-4xl font-bold text-sky-600 mt-2">{stats.totalTransaksi}</p>
                <p className="text-xs text-gray-500 mt-2">dalam periode terpilih</p>
              </div>

              {/* Total Pendapatan */}
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                <p className="text-gray-600 text-sm font-medium">Total Pendapatan</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  Rp {stats.totalPendapatan.toLocaleString('id-ID')}
                </p>
                <p className="text-xs text-gray-500 mt-2">revenue total</p>
              </div>

              {/* Rata-rata Pendapatan */}
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
                <p className="text-gray-600 text-sm font-medium">Rata-rata per Transaksi</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  Rp {stats.avgPendapatan.toLocaleString('id-ID')}
                </p>
                <p className="text-xs text-gray-500 mt-2">per transaksi</p>
              </div>
            </div>

            {/* Export Button */}
            {filteredTransaksi.length > 0 && (
              <div className="mb-6 flex gap-2">
                <button
                  onClick={handleExportCSV}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded-lg transition flex items-center gap-2"
                >
                  📥 Export to CSV
                </button>
              </div>
            )}

            {/* Table Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">📋 Detail Transaksi</h2>

              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Memuat data...</p>
                </div>
              ) : filteredTransaksi.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">No</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Plat Nomor</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Jenis</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Area</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Waktu Masuk</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Waktu Keluar</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700">Durasi</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Tarif/Jam</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700">Total Bayar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredTransaksi.map((transaksi, index) => (
                        <tr key={transaksi.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                          <td className="px-4 py-3 font-bold text-gray-900">{transaksi.plat_nomor}</td>
                          <td className="px-4 py-3 text-gray-600 text-sm">{transaksi.nama_jenis}</td>
                          <td className="px-4 py-3 text-gray-600 text-sm">{transaksi.nama_area}</td>
                          <td className="px-4 py-3 text-gray-600 text-xs">
                            {formatTanggal(transaksi.waktu_masuk)}
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-xs">
                            {transaksi.waktu_keluar ? formatTanggal(transaksi.waktu_keluar) : '-'}
                          </td>
                          <td className="px-4 py-3 text-center text-gray-600">
                            {hitungDurasi(transaksi.waktu_masuk, transaksi.waktu_keluar || '')}
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-sm">
                            Rp {transaksi.tarif_per_jam.toLocaleString('id-ID')}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-900">
                            Rp {parseInt(transaksi.total_bayar as any).toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-indigo-50 border-t-2 border-indigo-300">
                      <tr>
                        <td colSpan={5} className="px-4 py-3 text-right font-bold text-gray-900">
                          TOTAL:
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-sky-600 text-lg">
                          Rp {stats.totalPendapatan.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-lg">
                    {filterApplied
                      ? 'Tidak ada transaksi dalam periode terpilih'
                      : 'Belum ada data transaksi'}
                  </p>
                </div>
              )}
            </div>

            {/* Summary Box */}
            {filteredTransaksi.length > 0 && (
              <div className="mt-6 bg-gradient-to-r from-sky-50 to-purple-50 rounded-lg border-l-4 border-sky-500 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">📊 Ringkasan Laporan</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 font-medium">Periode Laporan</p>
                    <p className="text-gray-900 mt-1">{tanggalAwal} s/d {tanggalAkhir}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Jumlah Transaksi</p>
                    <p className="text-gray-900 mt-1">{stats.totalTransaksi} transaksi</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Total Pendapatan</p>
                    <p className="text-sky-600 font-bold mt-1">
                      Rp {stats.totalPendapatan.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </ProtectedLayout>
  );
}
