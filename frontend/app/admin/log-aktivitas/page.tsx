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

  const getUniqueUsers = () => {
    return [...new Set(logs.map((l) => l.user_id))].length;
  };

  const getUniqueTabel = () => {
    return [...new Set(logs.map((l) => l.tabel_terkait).filter(Boolean))].length;
  };

  const filteredLogs = logs.filter((log) => {
    const matchSearch =
      log.aktivitas.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.username.toLowerCase().includes(searchTerm.toLowerCase());

    const matchFilter =
      filter === 'semua' ||
      (filter !== 'semua' && log.tabel_terkait === filter);

    return matchSearch && matchFilter;
  });

  // Get unique tables for filter
  const uniqueTables = [...new Set(logs.map((l) => l.tabel_terkait).filter(Boolean))] as string[];

  // Get activities per user
  const getActivitiesByUser = (username: string) => {
    return logs.filter((l) => l.username === username).length;
  };

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

              {/* Search & Filter */}
              <div className="flex gap-4 flex-wrap">
                <input
                  type="text"
                  placeholder="Cari aktivitas, nama, atau username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 min-w-64 px-4 py-2 border-2 border-blue-300 rounded-lg text-slate-900 font-semibold placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 border-2 border-blue-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="semua">Semua Tabel</option>
                  {uniqueTables.map((table) => (
                    <option key={table} value={table}>
                      {table}
                    </option>
                  ))}
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
                <p className="text-gray-600 text-sm">Total Log</p>
                <p className="text-3xl font-bold text-gray-900">{logs.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-gray-600 text-sm">Pengguna Aktif</p>
                <p className="text-3xl font-bold text-blue-600">{getUniqueUsers()}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-gray-600 text-sm">Tabel Termodifikasi</p>
                <p className="text-3xl font-bold text-blue-600">{getUniqueTabel()}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-gray-600 text-sm">Filter Cocok</p>
                <p className="text-3xl font-bold text-sky-600">{filteredLogs.length}</p>
              </div>
            </div>

            {/* Top Users Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {[...new Set(logs.map((l) => l.username))]
                .sort((a, b) => getActivitiesByUser(b) - getActivitiesByUser(a))
                .slice(0, 3)
                .map((username, idx) => {
                  const user = logs.find((l) => l.username === username);
                  return (
                    <div key={username} className="bg-white rounded-lg shadow p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-600 uppercase">Top User #{idx + 1}</p>
                          <p className="text-lg font-semibold text-gray-900 mt-1">
                            {user?.nama}
                          </p>
                          <p className="text-sm text-gray-600">@{username}</p>
                        </div>
                        <span className="text-3xl font-bold text-blue-600">
                          {getActivitiesByUser(username)}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Logs Table */}
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
                        Waktu
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                        Pengguna
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                        Aktivitas
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                        Tabel
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                        ID Record
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredLogs.length > 0 ? (
                      filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                            {formatTanggal(log.waktu_aktivitas)}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div>
                              <p className="font-medium text-gray-900">{log.nama}</p>
                              <p className="text-xs text-gray-600">@{log.username}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {log.aktivitas}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {log.tabel_terkait ? (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                {log.tabel_terkait}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {log.id_record || '-'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-gray-600">
                          Tidak ada log yang sesuai
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </main>
        </div>
      </div>
    </ProtectedLayout>
  );
}
