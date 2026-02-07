'use client';

import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import ProtectedLayout from '@/components/ProtectedLayout';
import Modal from '@/components/Modal';
import { tarifParkirAPI } from '@/lib/api';

interface Tarif {
  id: number;
  jenis_kendaraan_id: number;
  tarif_per_jam: number;
  nama_jenis: string;
}

export default function TarifParkirPage() {
  const [tarifs, setTarifs] = useState<Tarif[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    jenisKendaraan: '',
    tarifPerJam: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const tarifRes = await tarifParkirAPI.getAll();
      setTarifs(tarifRes.data || []);
      setError('');
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.response?.data?.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({ jenisKendaraan: '', tarifPerJam: 0 });
    setShowForm(true);
  };

  const handleEditClick = (tarif: Tarif) => {
    setEditingId(tarif.id);
    setFormData({
      jenisKendaraan: tarif.nama_jenis,
      tarifPerJam: tarif.tarif_per_jam
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.jenisKendaraan.trim()) {
      setError('Jenis kendaraan harus diisi');
      return;
    }

    if (formData.tarifPerJam <= 0) {
      setError('Tarif per jam harus lebih dari 0');
      return;
    }

    try {
      const payload = {
        namaJenis: formData.jenisKendaraan,
        tarifPerJam: formData.tarifPerJam
      };

      if (editingId) {
        await tarifParkirAPI.update(editingId, payload);
      } else {
        await tarifParkirAPI.create(payload);
      }

      setShowForm(false);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menyimpan tarif');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus tarif ini?')) return;
    try {
      await tarifParkirAPI.delete(id);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menghapus tarif');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ jenisKendaraan: '', tarifPerJam: 0 });
  };

  return (
    <ProtectedLayout requiredRole="admin">
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader title="Kelola Tarif Parkir" role="admin" />
          <main className="flex-1 overflow-y-auto p-6">
            {/* Header */}
            <div className="mb-6 flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">Daftar Tarif Parkir</h1>
              <button
                onClick={handleAddClick}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition"
              >
                + Tambah Tarif
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Form Modal */}
            <Modal
              isOpen={showForm}
              title={editingId ? 'Edit Tarif Parkir' : 'Tambah Tarif Parkir Baru'}
              onClose={handleCancel}
              size="md"
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jenis Kendaraan <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.jenisKendaraan}
                      onChange={(e) => setFormData({ ...formData, jenisKendaraan: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                      placeholder="Contoh: Motor, Mobil, Bus"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tarif Per Jam (Rp) <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.tarifPerJam}
                      onChange={(e) => setFormData({ ...formData, tarifPerJam: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                      placeholder="Contoh: 2000"
                      required
                      min="1000"
                      step="1000"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                  >
                    {editingId ? 'Perbarui' : 'Tambah'} Tarif
                  </button>
                </div>
              </form>
            </Modal>

            {/* Tarif Table */}
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
                        Jenis Kendaraan
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                        Tarif/Jam
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {tarifs.map((tarif) => (
                      <tr key={tarif.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {tarif.nama_jenis}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          Rp {tarif.tarif_per_jam.toLocaleString('id-ID')}
                        </td>
                        <td className="px-6 py-4 text-sm space-x-2">
                          <button
                            onClick={() => handleEditClick(tarif)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(tarif.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {tarifs.length === 0 && (
                  <div className="text-center py-10 text-gray-600">
                    Belum ada tarif parkir. Silakan tambah tarif baru.
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
