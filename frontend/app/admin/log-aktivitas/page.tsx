'use client';

import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import ProtectedLayout from '@/components/ProtectedLayout';
import { logAktivitasAPI } from '@/lib/api';

interface LogAktivitas {
  id: number;
  user_id: number;
  nama: string;
  username: string;
  aktivitas: string;
  tabel_terkait: string | null;
  id_record: number | null;
  waktu_aktivitas: string;
}

export default function LogAktivitasPage() {
  const [logs, setLogs] = useState<LogAktivitas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('semua');
  const [userFilter, setUserFilter] = useState('semua');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await logAktivitasAPI.getAll();
      setLogs(response.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memuat log aktivitas');
      console.error('Error loading logs:', err);
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

  const formatWaktuSingkat = (date: string) => {
    const parsedDate = parseDate(date);
    if (!parsedDate) return 'Invalid Date';
    
    return parsedDate.toLocaleString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActivityIcon = (aktivitas: string): string => {
    if (aktivitas.toLowerCase().includes('tambah') || aktivitas.toLowerCase().includes('create')) return '➕';
    if (aktivitas.toLowerCase().includes('ubah') || aktivitas.toLowerCase().includes('update') || aktivitas.toLowerCase().includes('put')) return '✏️';
    if (aktivitas.toLowerCase().includes('hapus') || aktivitas.toLowerCase().includes('delete')) return '🗑️';
    if (aktivitas.toLowerCase().includes('login')) return '🔓';
    if (aktivitas.toLowerCase().includes('logout')) return '🔒';
    if (aktivitas.toLowerCase().includes('lihat') || aktivitas.toLowerCase().includes('get')) return '👁️';
    return '📝';
  };

  const translateActivity = (aktivitas: string): string => {
    const lower = aktivitas.toLowerCase();
    
    // User management
    if (lower.includes('users') && lower.includes('create')) return 'Menambahkan pengguna baru';
    if (lower.includes('users') && lower.includes('update')) return 'Memperbarui data pengguna';
    if (lower.includes('users') && lower.includes('delete')) return 'Menghapus pengguna';
    
    // Kendaraan management
    if (lower.includes('kendaraan') && lower.includes('create')) return 'Menambahkan data kendaraan';
    if (lower.includes('kendaraan') && lower.includes('update')) return 'Memperbarui data kendaraan';
    if (lower.includes('kendaraan') && lower.includes('delete')) return 'Menghapus data kendaraan';
    
    // Area parkir
    if (lower.includes('area') && lower.includes('create')) return 'Membuat area parkir baru';
    if (lower.includes('area') && lower.includes('update')) return 'Memperbarui area parkir';
    if (lower.includes('area') && lower.includes('delete')) return 'Menghapus area parkir';
    
    // Transaksi
    if (lower.includes('transaksi') && lower.includes('masuk')) return 'Kendaraan masuk parkir';
    if (lower.includes('transaksi') && lower.includes('keluar')) return 'Kendaraan keluar parkir';
    if (lower.includes('transaksi') && (lower.includes('update') || lower.includes('put'))) return 'Memproses pembayaran parkir';
    if (lower.includes('transaksi') && lower.includes('get')) return 'Melihat data transaksi';
    
    // Auth
    if (lower.includes('login')) return 'Login ke sistem';
    if (lower.includes('logout')) return 'Logout dari sistem';
    
    // Handle generic API patterns
    if (lower.includes('put') || lower.includes('update')) return 'Memperbarui data';
    if (lower.includes('post') || lower.includes('create')) return 'Menambahkan data';
    if (lower.includes('delete')) return 'Menghapus data';
    if (lower.includes('get')) return 'Melihat data';
    
    // Default - return as is if no match
    return aktivitas;
  };

  const filteredLogs = logs.filter((log) => {
    const matchSearch =
      log.aktivitas.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.username.toLowerCase().includes(searchTerm.toLowerCase());

    const matchTable = filter === 'semua' || log.tabel_terkait === filter;
    const matchUser = userFilter === 'semua' || log.username === userFilter;

    return matchSearch && matchTable && matchUser;
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'Pengguna', 'Username', 'Aktivitas', 'Tabel', 'Waktu'];
    const rows = filteredLogs.map((log) => [
      log.id,
      log.nama,
      log.username,
      log.aktivitas,
      log.tabel_terkait || '-',
      formatTanggal(log.waktu_aktivitas)
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `log-aktivitas-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleCleanup = async () => {
    const days = prompt('Hapus log yang lebih lama dari berapa hari? (default: 30)', '30');
    if (days === null) return;

    const daysNum = parseInt(days);
    if (isNaN(daysNum) || daysNum < 1) {
      alert('Masukkan angka positif');
      return;
    }

    if (!confirm(`Yakin hapus log lebih lama dari ${daysNum} hari?`)) return;

    try {
      await logAktivitasAPI.deleteOldLogs(daysNum);
      alert('Log lama berhasil dihapus');
      loadLogs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus log');
    }
  };

  return (
    <ProtectedLayout requiredRole="admin">
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader title="Log Aktivitas" role="admin" />
          <main className="flex-1 overflow-y-auto p-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold text-gray-900">Log Aktivitas Sistem</h1>
                <div className="flex gap-2">
                  <button
                    onClick={handleExportCSV}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    📥 Export CSV
                  </button>
                  <button
                    onClick={handleCleanup}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    🗑️ Cleanup
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-gray-600 text-sm">📊 Total Aktivitas</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{logs.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-gray-600 text-sm">👥 Pengguna Aktif</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{Array.from(new Set(logs.map((l) => l.user_id))).length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-gray-600 text-sm">📁 Tabel Terkait</p>
                <p className="text-3xl font-bold text-sky-600 mt-1">{Array.from(new Set(logs.map((l) => l.tabel_terkait).filter(Boolean))).length}</p>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Pengguna:</label>
                  <select
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded bg-white text-sm"
                  >
                    <option value="semua">Semua</option>
                    {Array.from(new Set(logs.map((l) => l.username))).map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>

                {Array.from(new Set(logs.map((l) => l.tabel_terkait).filter(Boolean))).length > 0 && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Tabel:</label>
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded bg-white text-sm"
                    >
                      <option value="semua">Semua</option>
                      {Array.from(new Set(logs.map((l) => l.tabel_terkait).filter(Boolean))).map((table: any) => (
                        <option key={table} value={table}>{table}</option>
                      ))}
                    </select>
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Cari aktivitas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded bg-white text-sm flex-1 min-w-48"
                />

                <div className="ml-auto text-sm text-gray-600 whitespace-nowrap">
                  Menampilkan <span className="font-semibold">{filteredLogs.length}</span> dari <span className="font-semibold">{logs.length}</span>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="text-center py-10">
                  <p className="text-gray-600">Memuat aktivitas...</p>
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="p-8 bg-white rounded shadow text-center text-gray-600">
                  <p>Tidak ada aktivitas yang sesuai</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredLogs.map((log) => (
                    <div key={log.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition">
                      <div className="flex gap-4 items-start">
                        {/* Icon & Time */}
                        <div className="flex flex-col items-center gap-2 pt-1 w-16">
                          <div className="text-2xl">{getActivityIcon(log.aktivitas)}</div>
                          <div className="text-xs text-gray-500 text-center">{formatWaktuSingkat(log.waktu_aktivitas)}</div>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{log.nama}</p>
                              <p className="text-sm text-gray-600 mt-1">{translateActivity(log.aktivitas)}</p>
                            </div>
                            <div className="text-right text-xs text-gray-500">
                              <div className="text-gray-400">{new Date(log.waktu_aktivitas).toLocaleDateString('id-ID')}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedLayout>
  );
}
