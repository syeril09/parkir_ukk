'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import SidebarPetugas from '@/components/SidebarPetugas';
import ProtectedLayout from '@/components/ProtectedLayout';
import { transaksiAPI, kendaraanAPI, areaParkirAPI } from '@/lib/api';
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

function TransaksiContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tipeTransaksi = searchParams?.get('type') || 'masuk';
  
  const [user, setUser] = useState<User | null>(null);
  const [kendaraanList, setKendaraanList] = useState<any[]>([]);
  const [selectedKendaraanId, setSelectedKendaraanId] = useState<number | null>(null);
  const [areaId, setAreaId] = useState(1);
  const [areas, setAreas] = useState<any[]>([]);
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchPlat, setSearchPlat] = useState('');
  const [transaksiToPrint, setTransaksiToPrint] = useState<any | null>(null);

  useEffect(() => {
    // Get user data
    const userStr = Cookies.get('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }

    // Load kendaraan data
    loadKendaraanData();
    // Load area data
    loadAreaData();
    // Load transaksi list
    loadTransaksiList();
  }, [tipeTransaksi]);

  const loadAreaData = async () => {
    try {
      const res = await areaParkirAPI.getAll();
      setAreas(res.data || []);
      // set default selected area to first available if current is invalid
      if ((res.data || []).length > 0) {
        const first = (res.data || [])[0];
        if (!areas.find((a) => a.id === areaId)) {
          setAreaId(first.id);
        }
      }
    } catch (err: any) {
      console.error('Error loading areas:', err);
    }
  };

  const loadKendaraanData = async () => {
    try {
      const res = await kendaraanAPI.getAll();
      setKendaraanList(res.data || []);
    } catch (err: any) {
      console.error('Error loading kendaraan:', err);
    }
  };

  const loadTransaksiList = async () => {
    try {
      const res = await transaksiAPI.getAll();
      if (tipeTransaksi === 'keluar') {
        // Filter transaksi yang belum keluar
        const transaksiAktif = res.data?.filter((t: any) => !t.waktu_keluar) || [];
        setTransaksiList(transaksiAktif);
      } else {
        // Tampilkan semua transaksi hari ini
        const today = new Date().toISOString().split('T')[0];
        const transaksiHariIni = res.data?.filter((t: any) =>
          new Date(t.waktu_masuk).toISOString().split('T')[0] === today
        ) || [];
        setTransaksiList(transaksiHariIni);
      }
    } catch (err: any) {
      console.error('Error loading transaksi:', err);
    }
  };

  const handleTambahTransaksi = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!selectedKendaraanId) {
        setError('Pilih kendaraan terlebih dahulu');
        setLoading(false);
        return;
      }

      const selectedKendaraan = kendaraanList.find((k) => k.id === selectedKendaraanId);
      if (!selectedKendaraan) {
        setError('Kendaraan tidak ditemukan');
        setLoading(false);
        return;
      }

      if (tipeTransaksi === 'masuk') {
        // Tambah transaksi masuk dengan plat nomor dari data kendaraan
        const response = await transaksiAPI.masuk(selectedKendaraan.plat_nomor, areaId);

        setSuccess(`✅ Kendaraan ${selectedKendaraan.plat_nomor} berhasil dicatat masuk!`);
        // response is {success, message, transaksiId, data: {...}} - we need the data property
        setTransaksiToPrint(response.data);
        setSelectedKendaraanId(null);
        setAreaId(1);
        await loadTransaksiList();
      }

      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan transaksi');
      setLoading(false);
    }
  };

  const handleKendaraanKeluar = async (transaksi: Transaksi) => {
    if (!confirm(`Catat kendaraan ${transaksi.plat_nomor} keluar?`)) {
      return;
    }

    try {
      setLoading(true);
      // Catat kendaraan keluar
      const response = await transaksiAPI.keluar(transaksi.plat_nomor);

      setSuccess(`✅ Kendaraan ${transaksi.plat_nomor} dicatat keluar!`);
      // Redirect ke cetak struk dengan transaksi ID
      setTimeout(() => {
        router.push(`/petugas/cetak-struk?transaksi=${response.data.id}`);
      }, 500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mencatat kendaraan keluar');
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

  const formatJam = (tanggal: string | null | undefined) => {
    const date = parseDate(tanggal);
    if (!date) return '-';
    
    const jam = String(date.getHours()).padStart(2, '0');
    const menit = String(date.getMinutes()).padStart(2, '0');
    return `${jam}:${menit}`;
  };

  const hitungDurasi = (masuk: string, keluar: string) => {
    const waktuMasuk = new Date(masuk);
    const waktuKeluar = new Date(keluar);
    const durasiMenit = Math.ceil((waktuKeluar.getTime() - waktuMasuk.getTime()) / (1000 * 60));
    const jam = Math.floor(durasiMenit / 60);
    const menit = durasiMenit % 60;
    return `${jam}j ${menit}m`;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <SidebarPetugas />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white shadow-md p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {tipeTransaksi === 'masuk' ? '🚙 Kendaraan Masuk' : '🚗 Kendaraan Keluar'}
              </h1>
              <p className="text-gray-600 mt-1">
                {tipeTransaksi === 'masuk'
                  ? 'Input kendaraan yang baru masuk area parkir'
                  : 'Catat kendaraan yang meninggalkan area parkir'}
              </p>
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
          {/* Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-sky-700 rounded-lg">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Input */}
            {tipeTransaksi === 'masuk' && (
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">📝 Input Kendaraan Masuk</h2>

                  <form onSubmit={handleTambahTransaksi} className="space-y-4">
                    {/* Pilih Kendaraan */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pilih Kendaraan <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedKendaraanId || ''}
                        onChange={(e) => setSelectedKendaraanId(parseInt(e.target.value))}
                        className="w-full px-4 py-2 border-2 border-sky-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white disabled:bg-gray-200"
                        disabled={loading}
                      >
                        <option value="">-- Pilih Kendaraan --</option>
                        {kendaraanList.map((kendaraan) => (
                          <option key={kendaraan.id} value={kendaraan.id}>
                            {kendaraan.plat_nomor} ({kendaraan.nama_jenis}) - {kendaraan.warna}
                          </option>
                        ))}
                      </select>
                      {kendaraanList.length === 0 && (
                        <p className="text-xs text-red-500 mt-1">⚠️ Belum ada data kendaraan. Admin perlu menambahkan data kendaraan terlebih dahulu.</p>
                      )}
                    </div>

                    {/* Area Parkir */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Area Parkir
                      </label>
                      <select
                        key={`area-${areaId}`}
                        value={areaId}
                        onChange={(e) => setAreaId(parseInt(e.target.value))}
                        className="w-full px-4 py-2 border-2 border-sky-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white disabled:bg-gray-200"
                        disabled={loading}
                      >
                        {areas.length === 0 ? (
                          <option value="">Memuat area...</option>
                        ) : (
                          <>
                            <option value="">-- Pilih Area Parkir --</option>
                            {areas.map((area) => (
                              <option
                                key={area.id}
                                value={area.id}
                                disabled={typeof area.tersedia === 'number' && area.tersedia <= 0}
                              >
                                {area.nama} ({area.jenisArea || area.jenis_area || 'area'}) — {area.tersedia}/{area.kapasitas} tersedia
                              </option>
                            ))}
                          </>
                        )}
                      </select>
                      {areas.length === 0 && (
                        <p className="text-xs text-gray-500 mt-1">⚠️ Belum ada data area. Admin perlu menambahkan area parkir.</p>
                      )}
                    </div>

                    {/* Detail Kendaraan - Display only */}
                    {selectedKendaraanId && (
                      <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 space-y-2">
                        <h3 className="font-semibold text-blue-900 text-sm">📋 Detail Kendaraan</h3>
                        {(() => {
                          const selected = kendaraanList.find((k) => k.id === selectedKendaraanId);
                          return selected ? (
                            <>
                              <p className="text-sm"><span className="font-medium">Plat:</span> {selected.plat_nomor}</p>
                              <p className="text-sm"><span className="font-medium">Jenis:</span> {selected.nama_jenis}</p>
                              <p className="text-sm"><span className="font-medium">Warna:</span> {selected.warna}</p>
                              <p className="text-sm"><span className="font-medium">Pemilik:</span> {selected.pemilik_nama}</p>
                              <p className="text-sm"><span className="font-medium">No. Telp:</span> {selected.pemilik_no_telp}</p>
                              {/* Tarif Info */}
                              <div className="mt-3 pt-3 border-t border-blue-200">
                                <p className="text-sm text-blue-800 font-semibold">💰 Tarif Dasar: <span className="text-lg">Rp 15.000/jam</span></p>
                                <p className="text-xs text-blue-600 mt-1">Estimasi biaya akan dihitung saat kendaraan keluar</p>
                              </div>
                            </>
                          ) : null;
                        })()}
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition"
                    >
                      {loading ? '⏳ Menyimpan...' : '✅ Catat Masuk'}
                    </button>
                  </form>

                  {/* Info Box */}
                  <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800">
                      <strong>💡 Tips:</strong> Masukkan plat nomor kendaraan yang baru masuk area parkir dengan benar.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Transaksi List */}
            <div className={tipeTransaksi === 'masuk' ? 'lg:col-span-2' : 'lg:col-span-3'}>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {tipeTransaksi === 'masuk' ? '📊 Daftar Kendaraan Masuk Hari Ini' : '🚗 Daftar Kendaraan Aktif'}
                </h2>

                {/* Search */}
                {tipeTransaksi === 'keluar' && (
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Cari plat nomor..."
                      value={searchPlat}
                      onChange={(e) => setSearchPlat(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-blue-300 rounded-lg text-slate-900 font-semibold placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>
                )}

                {/* Table */}
                {transaksiList.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">Plat Nomor</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">Waktu Masuk</th>
                          {tipeTransaksi === 'keluar' && (
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Durasi</th>
                          )}
                          <th className="px-4 py-3 text-center font-semibold text-gray-700">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {transaksiList
                          .filter((t) => t.plat_nomor.includes(searchPlat.toUpperCase()))
                          .map((transaksi) => {
                            const waktuMasuk = new Date(transaksi.waktu_masuk);
                            const sekarang = new Date();
                            const durasiJam = Math.ceil((sekarang.getTime() - waktuMasuk.getTime()) / (1000 * 60 * 60));

                            return (
                              <tr 
                                key={transaksi.id} 
                                className={`hover:bg-gray-50 ${durasiJam > 8 ? 'bg-yellow-50 border-l-4 border-yellow-500' : ''}`}
                              >
                                <td className="px-4 py-3 font-bold text-gray-900">
                                  {transaksi.plat_nomor}
                                  {durasiJam > 8 && <span className="ml-2 text-yellow-600 font-semibold text-xs">⚠️ LAMA</span>}
                                </td>
                                <td className="px-4 py-3 text-gray-600">{waktuMasuk.toLocaleString('id-ID')}</td>
                                {tipeTransaksi === 'keluar' && (
                                  <td className={`px-4 py-3 font-semibold ${durasiJam > 8 ? 'text-yellow-700' : 'text-gray-600'}`}>
                                    {durasiJam} jam
                                  </td>
                                )}
                                <td className="px-4 py-3 text-center">
                                  {tipeTransaksi === 'keluar' ? (
                                    <button
                                      onClick={() => handleKendaraanKeluar(transaksi)}
                                      disabled={loading}
                                      className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition"
                                    >
                                      Keluar
                                    </button>
                                  ) : (
                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                                      ✅ Tercatat
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-lg">
                      {tipeTransaksi === 'masuk'
                        ? 'Belum ada kendaraan masuk hari ini'
                        : 'Semua kendaraan sudah keluar atau tidak ada kendaraan aktif'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Struk Print Modal */}
        {transaksiToPrint && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-sky-500 to-purple-600 text-white px-6 py-4">
                <h3 className="text-lg font-bold">🧾 Cetak Struk Transaksi</h3>
              </div>

              {/* Struk Preview */}
              <div className="p-6 overflow-y-auto max-h-96">
                <div style={{ width: '80mm', margin: '0 auto', padding: '10mm', fontFamily: 'monospace', fontSize: '11px', border: '1px solid #ddd', borderRadius: '4px' }}>
                  <div style={{ textAlign: 'center', marginBottom: '8mm' }}>
                    <h1 style={{ fontSize: '16pt', marginBottom: '3mm', fontWeight: 'bold' }}>🅿️ BUKTI PARKIR</h1>
                    <p style={{ fontSize: '8pt', color: '#666' }}>Sistem Manajemen Parkir</p>
                  </div>

                  <hr style={{ borderTop: '1px dashed #333', marginBottom: '8mm' }} />

                  <div style={{ marginBottom: '6mm' }}>
                    <p style={{ fontSize: '8pt', color: '#666' }}>PLAT NOMOR</p>
                    <p style={{ fontSize: '13pt', fontWeight: 'bold' }}>{transaksiToPrint.plat_nomor}</p>
                  </div>

                  <div style={{ marginBottom: '6mm' }}>
                    <p style={{ fontSize: '8pt', color: '#666' }}>JENIS KENDARAAN</p>
                    <p style={{ fontSize: '9pt', fontWeight: 'bold' }}>{transaksiToPrint.nama_jenis}</p>
                  </div>

                  <div style={{ marginBottom: '6mm' }}>
                    <p style={{ fontSize: '8pt', color: '#666' }}>AREA PARKIR</p>
                    <p style={{ fontSize: '9pt' }}>{transaksiToPrint.nama_area}</p>
                  </div>

                  <hr style={{ borderTop: '1px dashed #333', marginBottom: '6mm' }} />

                  <div style={{ marginBottom: '6mm' }}>
                    <p style={{ fontSize: '8pt', color: '#666' }}>WAKTU MASUK</p>
                    <p style={{ fontSize: '8pt' }}>{formatTanggal(transaksiToPrint.waktu_masuk)}</p>
                  </div>

                  {transaksiToPrint.waktu_keluar ? (
                    <>
                      <div style={{ marginBottom: '6mm' }}>
                        <p style={{ fontSize: '8pt', color: '#666' }}>JAM MASUK - JAM KELUAR</p>
                        <p style={{ fontSize: '11pt', fontWeight: 'bold', color: '#1976d2' }}>
                          {formatJam(transaksiToPrint.waktu_masuk)} - {formatJam(transaksiToPrint.waktu_keluar)}
                        </p>
                      </div>

                      <div style={{ marginBottom: '6mm' }}>
                        <p style={{ fontSize: '8pt', color: '#666' }}>DURASI PARKIR</p>
                        <p style={{ fontSize: '10pt', fontWeight: 'bold' }}>
                          {hitungDurasi(transaksiToPrint.waktu_masuk, transaksiToPrint.waktu_keluar)}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div style={{ marginBottom: '6mm' }}>
                      <p style={{ fontSize: '8pt', color: '#666' }}>JAM MASUK</p>
                      <p style={{ fontSize: '11pt', fontWeight: 'bold', color: '#1976d2' }}>
                        {formatJam(transaksiToPrint.waktu_masuk)}
                      </p>
                    </div>
                  )}

                  {transaksiToPrint.waktu_keluar && (
                    <div style={{ marginBottom: '6mm' }}>
                      <p style={{ fontSize: '8pt', color: '#666' }}>TARIF PER JAM</p>
                      <p style={{ fontSize: '8pt' }}>Rp {transaksiToPrint.tarif_per_jam?.toLocaleString('id-ID')}</p>
                    </div>
                  )}

                  <hr style={{ borderTop: '1px dashed #333', marginBottom: '6mm' }} />

                  {transaksiToPrint.total_bayar && (
                    <div style={{ backgroundColor: '#e3f2fd', padding: '6mm', textAlign: 'center', marginBottom: '6mm', borderRadius: '3px' }}>
                      <p style={{ fontSize: '8pt', color: '#666' }}>TOTAL BAYAR</p>
                      <p style={{ fontSize: '14pt', fontWeight: 'bold', color: '#1976d2' }}>
                        Rp {parseInt(transaksiToPrint.total_bayar).toLocaleString('id-ID')}
                      </p>
                    </div>
                  )}

                  <hr style={{ borderTop: '1px dashed #333', marginBottom: '6mm' }} />

                  <div style={{ textAlign: 'center', fontSize: '7pt', color: '#999' }}>
                    <p>Terima Kasih</p>
                    <p>Semoga perjalanan Anda aman</p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
                <button
                  onClick={() => setTransaksiToPrint(null)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg font-medium transition"
                >
                  ✕ Tutup
                </button>
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition"
                >
                  🖨️ Cetak
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TransaksiPage() {
  return (
    <ProtectedLayout requiredRole="petugas">
      <Suspense fallback={<div>Loading...</div>}>
        <TransaksiContent />
      </Suspense>
    </ProtectedLayout>
  );
}
