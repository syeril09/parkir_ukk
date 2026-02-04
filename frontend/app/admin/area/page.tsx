'use client';

import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import ProtectedLayout from '@/components/ProtectedLayout';
import { areaParkirAPI } from '@/lib/api';

interface AreaParkir {
  id: number;
  nama: string;
  lokasi: string;
  kapasitas: number;
  tersedia: number;
}

export default function KelolaAreaPage() {
  const [areas, setAreas] = useState<AreaParkir[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nama: '',
    lokasi: '',
    kapasitas: 0,
    hargaPerJam: 0,
    deskripsi: ''
  });

  useEffect(() => {
    loadAreas();
  }, []);

  const loadAreas = async () => {
    try {
      setLoading(true);
      const response = await areaParkirAPI.getAll();
      setAreas(response.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memuat area parkir');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({ nama: '', lokasi: '', kapasitas: 0, hargaPerJam: 0, deskripsi: '' });
    setShowForm(true);
  };

  const handleEditClick = (area: AreaParkir) => {
    setEditingId(area.id);
    setFormData({
      nama: area.nama,
      lokasi: area.lokasi,
      kapasitas: area.kapasitas,
      hargaPerJam: 0,
      deskripsi: ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        namaArea: formData.nama,
        lokasi: formData.lokasi,
        kapasitas: formData.kapasitas,
        hargaPerJam: formData.hargaPerJam,
        deskripsi: formData.deskripsi
      };

      if (editingId) {
        await areaParkirAPI.update(editingId, payload);
      } else {
        await areaParkirAPI.create(payload);
      }
      setShowForm(false);
      loadAreas();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menyimpan area');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus area ini?')) return;
    try {
      await areaParkirAPI.delete(id);
      loadAreas();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menghapus area');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ nama: '', lokasi: '', kapasitas: 0, hargaPerJam: 0, deskripsi: '' });
  };

  return (
    <ProtectedLayout requiredRole="admin">
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader title="Kelola Area Parkir" role="admin" />
          <main className="flex-1 overflow-y-auto p-6">
            {/* Header */}
            <div className="mb-6 flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">Daftar Area Parkir</h1>
              <button
                onClick={handleAddClick}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
              >
                + Tambah Area
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Form Modal */}
            {showForm && (
              <div className="mb-6 bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {editingId ? 'Edit Area Parkir' : 'Tambah Area Parkir Baru'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Area
                      </label>
                      <input
                        key={`nama-${editingId}`}
                        type="text"
                        value={formData.nama ?? ''}
                        onChange={(e) =>
                          setFormData({ ...formData, nama: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Misal: Area A, Area Utama"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lokasi
                      </label>
                      <input
                        key={`lokasi-${editingId}`}
                        type="text"
                        value={formData.lokasi ?? ''}
                        onChange={(e) =>
                          setFormData({ ...formData, lokasi: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Misal: Lantai 1, Depan Toko"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kapasitas
                      </label>
                      <input
                        key={`kapasitas-${editingId}`}
                        type="number"
                        value={formData.kapasitas ?? 0}
                        onChange={(e) =>
                          setFormData({ 
                            ...formData, 
                            kapasitas: e.target.value ? parseInt(e.target.value) : 0 
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Jumlah slot parkir"
                        required
                        min="1"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Harga Per Jam (Rp)
                      </label>
                      <input
                        key={`harga-${editingId}`}
                        type="number"
                        value={formData.hargaPerJam ?? 0}
                        onChange={(e) =>
                          setFormData({ 
                            ...formData, 
                            hargaPerJam: e.target.value ? parseInt(e.target.value) : 0 
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Misal: 5000"
                        required
                        min="1000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deskripsi
                      </label>
                      <input
                        key={`deskripsi-${editingId}`}
                        type="text"
                        value={formData.deskripsi ?? ''}
                        onChange={(e) =>
                          setFormData({ ...formData, deskripsi: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Misal: Area dengan AC, Aman 24 jam"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Simpan
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {areas.map((area) => (
                <div key={area.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-gray-900">{area.nama}</h3>
                    <span className="text-2xl">🅿️</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">📍 {area.lokasi}</p>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Kapasitas</p>
                    <p className="text-2xl font-bold text-gray-900">{area.kapasitas}</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${((area.kapasitas - area.tersedia) / area.kapasitas) * 100}%`
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mb-4">
                    Terpakai: {area.kapasitas - area.tersedia} / Tersedia: {area.tersedia}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(area)}
                      className="flex-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(area.id)}
                      className="flex-1 text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-10">
                <p className="text-gray-600">Memuat data...</p>
              </div>
            ) : areas.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-10 text-center">
                <p className="text-gray-600 mb-4">Belum ada area parkir.</p>
                <button
                  onClick={handleAddClick}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                  Tambah Area Sekarang
                </button>
              </div>
            ) : null}
          </main>
        </div>
      </div>
    </ProtectedLayout>
  );
}
