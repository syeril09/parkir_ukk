'use client';

import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import AdminSidebar from '@/components/AdminSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import ProtectedLayout from '@/components/ProtectedLayout';
import Modal from '@/components/Modal';
import { kendaraanAPI } from '@/lib/api';

interface Kendaraan {
  id: number;
  plat_nomor: string;
  jenis_kendaraan_id: number;
  nama_jenis: string;
  warna: string;
  pemilik_nama: string;
  pemilik_no_telp: string;
}

interface JenisKendaraan {
  id: number;
  nama_jenis: string;
}

export default function DaftarKendaraanPage() {
  const [kendaraan, setKendaraan] = useState<Kendaraan[]>([]);
  const [jenisKendaraan, setJenisKendaraan] = useState<JenisKendaraan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    platNomor: '',
    jenisKendaraanId: '',
    jenisKendaraanName: '',
    warna: '',
    pemilikNama: '',
    pemilikNoTelp: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [jenisSuggestions, setJenisSuggestions] = useState<JenisKendaraan[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [kendaraanRes, jenisRes] = await Promise.all([
        kendaraanAPI.getAll(),
        kendaraanAPI.getAllJenis()
      ]);
      console.log('✅ loadData - kendaraanRes:', kendaraanRes);
      console.log('✅ loadData - jenisRes:', jenisRes);
      setKendaraan(kendaraanRes?.data || []);
      // jenisRes may be an unknown shape when fetched via Promise.all; assert expected structure
      const jenisData = (jenisRes as any)?.data ?? [];
      setJenisKendaraan(jenisData as JenisKendaraan[]);
      setError('');
    } catch (err: any) {
      console.error('❌ loadData error:', err);
      const errorMsg = err?.response?.data?.message || err?.message || 'Gagal memuat data';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({ platNomor: '', jenisKendaraanId: '', jenisKendaraanName: '', warna: '', pemilikNama: '', pemilikNoTelp: '' });
    setShowForm(true);
  };

  const handleEditClick = async (item: Kendaraan) => {
    try {
      const response = await kendaraanAPI.getById(item.id);
      const kendaraanDetail = response.data || response;
      console.log('🔍 Loaded kendaraan:', kendaraanDetail.plat_nomor, 'jenis:', kendaraanDetail.jenis_kendaraan_id);
      
      const jenisId = kendaraanDetail.jenis_kendaraan_id ?? null;
      const namaJenisFromDetail = kendaraanDetail.nama_jenis ?? '';
      const namaJenisFromList = jenisKendaraan.find(j => j.id === jenisId)?.nama_jenis ?? '';
      const jenisName = namaJenisFromDetail || namaJenisFromList || '';

      // Set all state at once with flushSync
      flushSync(() => {
        setEditingId(item.id);
        setFormData({
          platNomor: kendaraanDetail.plat_nomor || '',
          jenisKendaraanId: jenisId ? String(jenisId) : '',
          jenisKendaraanName: jenisName,
          warna: kendaraanDetail.warna || '',
          pemilikNama: kendaraanDetail.pemilik_nama || '',
          pemilikNoTelp: kendaraanDetail.pemilik_no_telp || ''
        });
        setShowForm(true);
      });
      
      console.log('✅ Form opened with jenis:', jenisId);
    } catch (err: any) {
      console.error('❌ Error:', err);
      setError('Gagal memuat data kendaraan untuk edit');
    }
  };

  const handleJenisInput = (value: string) => {
    // Update display name and filter suggestions, but keep ID intact
    setFormData({ ...formData, jenisKendaraanName: value });
    
    if (value.trim()) {
      const filtered = jenisKendaraan.filter(j =>
        j.nama_jenis.toLowerCase().includes(value.toLowerCase())
      );
      setJenisSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setJenisSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectJenis = (jenis: JenisKendaraan) => {
    setFormData({ ...formData, jenisKendaraanId: String(jenis.id), jenisKendaraanName: jenis.nama_jenis });
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that jenis_kendaraan_id is selected
    if (!formData.jenisKendaraanId || isNaN(parseInt(formData.jenisKendaraanId))) {
      setError('Pilih jenis kendaraan dari daftar');
      return;
    }
    
    try {
      const submitData = {
        ...formData,
        jenisKendaraanId: parseInt(formData.jenisKendaraanId)
      };
      console.log('📤 SUBMIT START - formData state:', formData);
      console.log('   ✓ jenisKendaraanId (string):', formData.jenisKendaraanId);
      console.log('   ✓ jenisKendaraanId (parsed int):', submitData.jenisKendaraanId);
      console.log('📤 Full submitData:', JSON.stringify(submitData));
      
      let result;
      if (editingId) {
        console.log('🔄 UPDATE mode - id:', editingId);
        result = await kendaraanAPI.update(editingId, submitData);
      } else {
        console.log('✨ CREATE mode');
        result = await kendaraanAPI.create(submitData);
      }
      console.log('✅ API Response:', result);
      setShowForm(false);
      loadData();
    } catch (err: any) {
      console.error('❌ Submit error:', err);
      setError(err.response?.data?.message || 'Gagal menyimpan kendaraan');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kendaraan ini?')) return;
    try {
      await kendaraanAPI.delete(id);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menghapus kendaraan');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ platNomor: '', jenisKendaraanId: '', jenisKendaraanName: '', warna: '', pemilikNama: '', pemilikNoTelp: '' });
    setShowSuggestions(false);
  };

  const filteredKendaraan = kendaraan.filter((k) =>
    k.plat_nomor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.pemilik_nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedLayout requiredRole="admin">
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader title="Daftar Kendaraan" role="admin" />
          <main className="flex-1 overflow-y-auto p-6">
            {/* Header */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold text-gray-900">Daftar Kendaraan</h1>
                <button
                  onClick={handleAddClick}
                  className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg transition"
                >
                  + Tambah Kendaraan
                </button>
              </div>
              <input
                type="text"
                placeholder="Cari berdasarkan plat nomor atau pemilik..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border-2 border-sky-300 rounded-lg text-slate-900 font-semibold placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-300 text-red-800 rounded-lg">
                <p className="font-semibold mb-2">⚠️ {error}</p>
                <p className="text-sm mb-3">Pastikan backend server sudah berjalan:</p>
                <code className="block bg-red-100 p-2 rounded text-xs mb-3">
                  cd backend && node index.js
                </code>
                <p className="text-sm">Backend harus running di http://localhost:5000</p>
              </div>
            )}

            {/* Form Modal */}
            <Modal
              isOpen={showForm}
              title={editingId ? 'Edit Kendaraan' : 'Tambah Kendaraan Baru'}
              onClose={handleCancel}
              size="md"
            >
              <form key={`form-${editingId}`} onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Plat Nomor <span className="text-gray-500 text-xs">(Max 20 karakter)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.platNomor ?? ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            platNomor: e.target.value.toUpperCase().slice(0, 20)
                          })
                        }
                        className="w-full px-3 py-2 border-2 border-sky-300 rounded-lg text-slate-900 font-semibold placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
                        placeholder="Misal: AB 1234 CD"
                        maxLength={20}
                        required
                      />
                      <div className="text-xs text-gray-500 mt-1">{formData.platNomor.length}/20</div>
                    </div>
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jenis Kendaraan
                      </label>
                      <input
                        type="text"
                        value={formData.jenisKendaraanName ?? ''}
                        onChange={(e) => handleJenisInput(e.target.value)}
                        onFocus={() => handleJenisInput(formData.jenisKendaraanName ?? '')}
                        className="w-full px-3 py-2 border-2 border-sky-300 rounded-lg text-slate-900 font-semibold placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
                        placeholder="Ketik atau pilih jenis kendaraan"
                        required
                      />
                      {showSuggestions && jenisSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-sky-300 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                          {jenisSuggestions.map((jenis) => (
                            <button
                              key={jenis.id}
                              type="button"
                              onClick={() => selectJenis(jenis)}
                              className="w-full px-3 py-2 text-left hover:bg-sky-100 text-slate-900 font-semibold text-sm"
                            >
                              {jenis.nama_jenis}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Warna
                      </label>
                      <input
                        type="text"
                        value={formData.warna ?? ''}
                        onChange={(e) =>
                          setFormData({ ...formData, warna: e.target.value })
                        }
                        className="w-full px-3 py-2 border-2 border-sky-300 rounded-lg text-slate-900 font-semibold placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
                        placeholder="Misal: Merah, Hitam"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Pemilik
                      </label>
                      <input
                        type="text"
                        value={formData.pemilikNama ?? ''}
                        onChange={(e) =>
                          setFormData({ ...formData, pemilikNama: e.target.value })
                        }
                        className="w-full px-3 py-2 border-2 border-sky-300 rounded-lg text-slate-900 font-semibold placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white"
                        placeholder="Nama pemilik"
                        required
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
                      className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
                    >
                      Simpan
                    </button>
                  </div>
                </form>
            </Modal>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-gray-600 text-sm">Total Kendaraan</p>
                <p className="text-2xl font-bold text-gray-900">{kendaraan.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-gray-600 text-sm">Motor</p>
                <p className="text-2xl font-bold text-gray-900">
                  {kendaraan.filter((k) => k.nama_jenis === 'Motor').length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-gray-600 text-sm">Mobil</p>
                <p className="text-2xl font-bold text-gray-900">
                  {kendaraan.filter((k) => k.nama_jenis === 'Mobil').length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-gray-600 text-sm">Bus</p>
                <p className="text-2xl font-bold text-gray-900">
                  {kendaraan.filter((k) => k.nama_jenis === 'Bus').length}
                </p>
              </div>
            </div>

            {/* Kendaraan Table */}
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
                        Warna
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                        Pemilik
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredKendaraan.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {item.plat_nomor}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {item.nama_jenis}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.warna}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{item.pemilik_nama}</td>
                        <td className="px-6 py-4 text-sm space-x-2">
                          <button
                            onClick={() => handleEditClick(item)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredKendaraan.length === 0 && (
                  <div className="text-center py-10 text-gray-600">
                    {searchTerm ? 'Tidak ada hasil pencarian' : 'Belum ada kendaraan'}
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
