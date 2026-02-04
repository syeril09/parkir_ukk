'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import ProtectedLayout from '@/components/ProtectedLayout';
import { transaksiAPI } from '@/lib/api';
import QRCode from 'qrcode';

interface Transaksi {
  id: number;
  plat_nomor: string;
  nama_jenis: string;
  nama_area: string;
  waktu_masuk: string;
  waktu_keluar: string | null;
  durasi_jam: number | null;
  tarif_per_jam: number;
  total_bayar: number | null;
  metode_pembayaran?: 'cash' | 'qris';
  uang_diterima?: number | null;
  kembalian?: number;
  status: 'parkir' | 'selesai';
}

export default function PembayaranPage() {
  const searchParams = useSearchParams();
  const transaksiIdFromUrl = searchParams?.get('transaksi');
  
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTransaksi, setSelectedTransaksi] = useState<Transaksi | null>(null);
  const [searchPlat, setSearchPlat] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris' | null>(null);
  const [uangDiterima, setUangDiterima] = useState<number>(0);
  const [processing, setProcessing] = useState(false);
  const [paid, setPaid] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    loadTransaksi();
  }, []);

  // Jika ada parameter transaksi dari URL, langsung select transaksi tersebut
  useEffect(() => {
    if (transaksiIdFromUrl && transaksiList.length > 0) {
      const transaksi = transaksiList.find(t => t.id === parseInt(transaksiIdFromUrl));
      if (transaksi) {
        setSelectedTransaksi(transaksi);
      }
    }
  }, [transaksiIdFromUrl, transaksiList]);

  // Generate QR code ketika metode pembayaran adalah QRIS
  useEffect(() => {
    if (paymentMethod === 'qris' && selectedTransaksi && qrCanvasRef.current) {
      const qrData = 'https://link.dana.id/minta?full_url=https://qr.dana.id/v1/281012012024072391654262';

      QRCode.toCanvas(qrCanvasRef.current, qrData, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 200,
      }).catch((err: any) => console.error('QR Code error:', err));
    }
  }, [paymentMethod, selectedTransaksi]);

  const loadTransaksi = async () => {
    try {
      const res = await transaksiAPI.getAll();
      const allTransaksi = res.data || [];
      setTransaksiList(allTransaksi);
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
    if (isNaN(date.getTime())) return null;
    return date;
  };

  const formatJam = (tanggal: string | null | undefined) => {
    const date = parseDate(tanggal);
    if (!date) return '-';
    const jam = String(date.getHours()).padStart(2, '0');
    const menit = String(date.getMinutes()).padStart(2, '0');
    return `${jam}:${menit}`;
  };

  const handlePembayaran = async () => {
    if (!selectedTransaksi || !paymentMethod) return;

    setProcessing(true);
    try {
      let kembalian = 0;
      if (paymentMethod === 'cash') {
        kembalian = uangDiterima - (selectedTransaksi.total_bayar || 0);
        if (kembalian < 0) {
          setError('Uang yang diterima kurang!');
          setProcessing(false);
          return;
        }
      }

      // Format waktu pembayaran untuk MySQL (YYYY-MM-DD HH:mm:ss)
      const now = new Date();
      const waktuPembayaran = now.toISOString().slice(0, 19).replace('T', ' ');

      const updateData = {
        metode_pembayaran: paymentMethod,
        uang_diterima: paymentMethod === 'cash' ? uangDiterima : selectedTransaksi.total_bayar,
        kembalian: paymentMethod === 'cash' ? kembalian : 0,
        waktu_pembayaran: waktuPembayaran,
      };

      await transaksiAPI.update(selectedTransaksi.id, updateData);

      const updatedTransaksi = {
        ...selectedTransaksi,
        ...updateData,
        metode_pembayaran: paymentMethod as 'cash' | 'qris',
        uang_diterima: updateData.uang_diterima,
        kembalian: updateData.kembalian,
      };

      setSelectedTransaksi(updatedTransaksi as Transaksi);
      setPaid(true);
      setError('');
    } catch (err: any) {
      console.error('Error saat pembayaran:', err);
      setError(err.response?.data?.message || 'Gagal memproses pembayaran');
    } finally {
      setProcessing(false);
    }
  };

  const resetPembayaran = () => {
    setSelectedTransaksi(null);
    setPaymentMethod(null);
    setUangDiterima(0);
    setPaid(false);
    setError('');
  };

  // Halaman pilih transaksi - simplified
  if (!selectedTransaksi) {
    const availableTransaksi = transaksiList
      .filter((t) => t.status === 'selesai' && !t.metode_pembayaran && t.waktu_keluar && t.plat_nomor.includes(searchPlat.toUpperCase()))
      .reverse();

    return (
      <ProtectedLayout requiredRole="petugas">
        <div className="min-h-screen bg-gradient-to-br from-sky-50 to-cyan-50 p-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-sky-500 to-cyan-600 text-white p-8">
                <h1 className="text-4xl font-bold mb-2">💳 Pembayaran</h1>
                <p className="text-sky-100">Cari dan pilih kendaraan untuk melanjutkan pembayaran</p>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Search Input */}
                <input
                  type="text"
                  placeholder="Ketik plat nomor... (contoh: WR 1234 ABC)"
                  value={searchPlat}
                  onChange={(e) => setSearchPlat(e.target.value)}
                  className="w-full px-4 py-4 text-lg border-2 border-sky-300 rounded-xl text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent mb-6"
                  autoFocus
                />

                {/* Error */}
                {error && (
                  <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg mb-4">
                    {error}
                  </div>
                )}

                {/* List atau empty state */}
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin inline-block w-12 h-12 border-4 border-sky-300 border-t-sky-600 rounded-full"></div>
                    <p className="text-gray-600 mt-4">Memuat data...</p>
                  </div>
                ) : availableTransaksi.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <p className="text-3xl mb-2">📋</p>
                    <p className="text-gray-600">
                      {searchPlat ? 'Tidak ada transaksi yang cocok' : 'Mulai ketik plat nomor untuk mencari'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {availableTransaksi.map((transaksi) => (
                      <button
                        key={transaksi.id}
                        onClick={() => setSelectedTransaksi(transaksi)}
                        className="w-full text-left p-4 rounded-xl bg-gradient-to-r from-sky-50 to-cyan-50 hover:from-sky-100 hover:to-cyan-100 transition border-2 border-sky-200 hover:border-sky-400 hover:shadow-md"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="text-2xl font-bold text-sky-700 mb-1">{transaksi.plat_nomor}</div>
                            <div className="text-sm text-gray-600">
                              {transaksi.nama_jenis} • {transaksi.nama_area}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-sky-600">
                              Rp {(transaksi.total_bayar || 0).toLocaleString('id-ID')}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  // Halaman form pembayaran - simplified
  if (!paid) {
    return (
      <ProtectedLayout requiredRole="petugas">
        <div className="min-h-screen bg-gradient-to-br from-sky-50 to-cyan-50 p-4 flex items-center justify-center">
          <div className="max-w-lg w-full">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-sky-500 to-cyan-600 text-white p-8">
                <h2 className="text-4xl font-bold mb-1">{selectedTransaksi.plat_nomor}</h2>
                <p className="text-sky-100">{selectedTransaksi.nama_jenis} • {selectedTransaksi.nama_area}</p>
              </div>

              {/* Quick Info */}
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-600 text-xs font-semibold">MASUK</p>
                    <p className="font-bold text-lg text-gray-900">{formatJam(selectedTransaksi.waktu_masuk)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs font-semibold">KELUAR</p>
                    <p className="font-bold text-lg text-gray-900">{formatJam(selectedTransaksi.waktu_keluar)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 text-xs font-semibold">DURASI</p>
                    <p className="font-bold text-gray-900">{selectedTransaksi.durasi_jam} jam</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs font-semibold">TARIF</p>
                    <p className="font-bold text-gray-900">Rp {selectedTransaksi.tarif_per_jam.toLocaleString('id-ID')}</p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-100 text-red-700 text-sm font-semibold border-b border-red-400">
                  ⚠️ {error}
                </div>
              )}

              {/* Total Amount - Big and Bold */}
              <div className="p-6 border-b border-gray-200">
                <p className="text-gray-600 text-xs font-semibold mb-2">TOTAL PEMBAYARAN</p>
                <p className="text-5xl font-bold text-sky-600">
                  Rp {(selectedTransaksi.total_bayar || 0).toLocaleString('id-ID')}
                </p>
              </div>

              {/* Payment Method Selection */}
              <div className="p-6">
                <p className="text-xs font-bold text-gray-700 mb-4 uppercase">PILIH METODE PEMBAYARAN</p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-5 rounded-xl border-3 font-bold transition-all text-lg ${
                      paymentMethod === 'cash'
                        ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-lg'
                        : 'border-gray-300 hover:border-sky-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    💵 CASH
                  </button>
                  <button
                    onClick={() => setPaymentMethod('qris')}
                    className={`p-5 rounded-xl border-3 font-bold transition-all text-lg ${
                      paymentMethod === 'qris'
                        ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-lg'
                        : 'border-gray-300 hover:border-purple-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    📱 QRIS
                  </button>
                </div>

                {/* Cash Payment Input */}
                {paymentMethod === 'cash' && (
                  <div className="mb-6 p-4 bg-amber-50 rounded-xl border-2 border-amber-200">
                    <p className="text-xs font-bold text-gray-700 mb-3 uppercase">UANG DITERIMA</p>
                    <input
                      type="number"
                      value={uangDiterima || ''}
                      onChange={(e) => setUangDiterima(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-4 py-3 border-2 border-amber-300 rounded-lg text-slate-900 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-amber-500 mb-3"
                      autoFocus
                    />
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">KEMBALIAN</p>
                      <p className={`text-3xl font-bold ${
                        uangDiterima >= (selectedTransaksi.total_bayar || 0)
                          ? 'text-sky-600'
                          : 'text-red-600'
                      }`}>
                        Rp {Math.max(0, uangDiterima - (selectedTransaksi.total_bayar || 0)).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                )}

                {/* QRIS Info */}
                {paymentMethod === 'qris' && (
                  <div className="mb-6 p-6 bg-purple-50 rounded-xl border-2 border-purple-200">
                    <div className="text-center mb-4">
                      <p className="text-lg font-bold text-purple-900 mb-2">💜 Pembayaran Dana</p>
                      <p className="text-sm text-gray-700 mb-4">Pelanggan scan QRIS di bawah untuk membayar</p>
                      <p className="text-2xl font-bold text-purple-600 mb-4">
                        Rp {(selectedTransaksi.total_bayar || 0).toLocaleString('id-ID')}
                      </p>
                    </div>
                    
                    {/* QR Code Canvas */}
                    <div className="bg-white p-6 rounded-lg text-center mb-4">
                      <canvas 
                        ref={qrCanvasRef} 
                        className="max-w-xs mx-auto rounded-lg border-2 border-purple-200"
                      />
                    </div>
                    
                    <p className="text-xs text-gray-600 text-center">
                      Scan dengan Dana, OVO, GCash, atau aplikasi e-wallet lainnya
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={resetPembayaran}
                    className="flex-1 px-4 py-3 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg font-bold transition"
                  >
                    ← Kembali
                  </button>
                  <button
                    onClick={handlePembayaran}
                    disabled={!paymentMethod || (paymentMethod === 'cash' && uangDiterima < (selectedTransaksi.total_bayar || 0)) || processing}
                    className={`flex-1 px-4 py-3 rounded-lg font-bold transition text-white ${
                      !paymentMethod || (paymentMethod === 'cash' && uangDiterima < (selectedTransaksi.total_bayar || 0))
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-sky-500 hover:bg-sky-600'
                    }`}
                  >
                    {processing ? '⏳ Proses...' : '✓ Bayar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  // Halaman struk - simplified
  return (
    <ProtectedLayout requiredRole="petugas">
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-cyan-50 p-4 print:p-0 print:bg-white">
        <div className="max-w-sm mx-auto">
          {/* Preview struk */}
          <div className="print:hidden bg-white rounded-2xl shadow-xl mb-6 overflow-hidden">
            {/* Struk Preview */}
            <div style={{ fontFamily: 'monospace', fontSize: '13px', padding: '24px', backgroundColor: '#fff' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h1 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '3px' }}>🅿️ BUKTI PARKIR</h1>
                <p style={{ fontSize: '10px', color: '#999' }}>Sistem Manajemen Parkir</p>
              </div>

              <hr style={{ borderTop: '2px solid #333', marginBottom: '15px' }} />

              <div style={{ marginBottom: '12px' }}>
                <p style={{ fontSize: '10px', color: '#999', marginBottom: '3px', fontWeight: 'bold' }}>PLAT NOMOR</p>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#000' }}>{selectedTransaksi.plat_nomor}</p>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <p style={{ fontSize: '10px', color: '#999', marginBottom: '3px', fontWeight: 'bold' }}>JENIS KENDARAAN</p>
                <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#000' }}>{selectedTransaksi.nama_jenis}</p>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <p style={{ fontSize: '10px', color: '#999', marginBottom: '3px', fontWeight: 'bold' }}>AREA PARKIR</p>
                <p style={{ fontSize: '13px', color: '#000' }}>{selectedTransaksi.nama_area}</p>
              </div>

              <hr style={{ borderTop: '2px solid #333', margin: '15px 0' }} />

              <div style={{ marginBottom: '12px', fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#000' }}>
                  <span>Masuk</span>
                  <span style={{ fontWeight: 'bold' }}>{formatJam(selectedTransaksi.waktu_masuk)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#000' }}>
                  <span>Keluar</span>
                  <span>{formatJam(selectedTransaksi.waktu_keluar)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#000' }}>
                  <span>Durasi</span>
                  <span>{selectedTransaksi.durasi_jam} jam</span>
                </div>
              </div>

              <div style={{ marginBottom: '12px', fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#000' }}>
                  <span>Tarif</span>
                  <span>Rp {selectedTransaksi.tarif_per_jam.toLocaleString('id-ID')}/jam</span>
                </div>
              </div>

              <hr style={{ borderTop: '2px solid #333', margin: '15px 0' }} />

              <div style={{ marginBottom: '12px', fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#000', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 'bold' }}>Metode Bayar</span>
                  <span style={{ fontWeight: 'bold' }}>{selectedTransaksi.metode_pembayaran === 'cash' ? '💵 CASH' : '📱 QRIS'}</span>
                </div>
              </div>

              {selectedTransaksi.metode_pembayaran === 'cash' && (
                <div style={{ marginBottom: '12px', fontSize: '11px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#000' }}>
                    <span>Uang</span>
                    <span>Rp {(selectedTransaksi.uang_diterima || 0).toLocaleString('id-ID')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#000' }}>
                    <span>Kembalian</span>
                    <span>Rp {(selectedTransaksi.kembalian || 0).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              )}

              {selectedTransaksi.metode_pembayaran === 'qris' && (
                <div style={{ marginBottom: '12px', textAlign: 'center' }}>
                  <p style={{ fontSize: '9px', color: '#999', marginBottom: '8px' }}>QRIS DANA</p>
                  <img
                    src="/qris-dana.png"
                    alt="QRIS Dana"
                    style={{ maxWidth: '150px', margin: '0 auto', borderRadius: '4px' }}
                  />
                  <p style={{ fontSize: '9px', color: '#999', marginTop: '4px' }}>+62 821 4194 5168</p>
                  <a
                    href="/qris"
                    target="_blank"
                    style={{
                      display: 'inline-block',
                      marginTop: '8px',
                      padding: '4px 8px',
                      backgroundColor: '#00897b',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '3px',
                      fontSize: '8px'
                    }}
                  >
                    📱 Buka QR Besar
                  </a>
                </div>
              )}

              <hr style={{ borderTop: '2px solid #333', margin: '15px 0' }} />

              <div style={{ backgroundColor: '#e8f5e9', padding: '12px', textAlign: 'center', marginBottom: '15px', borderRadius: '4px' }}>
                <p style={{ fontSize: '10px', color: '#666', marginBottom: '4px', fontWeight: 'bold' }}>TOTAL BAYAR</p>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#00897b' }}>
                  Rp {(selectedTransaksi.total_bayar || 0).toLocaleString('id-ID')}
                </p>
              </div>

              <hr style={{ borderTop: '2px solid #333', marginBottom: '15px' }} />

              <div style={{ textAlign: 'center', fontSize: '10px', color: '#999' }}>
                <p>Terima Kasih</p>
                <p>Semoga perjalanan Anda aman</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="print:hidden flex gap-3 mb-4">
            <button
              onClick={() => window.print()}
              className="flex-1 px-4 py-4 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-bold transition text-lg"
            >
              🖨️ Cetak Struk
            </button>
            <button
              onClick={resetPembayaran}
              className="flex-1 px-4 py-4 bg-gray-400 hover:bg-gray-500 text-white rounded-lg font-bold transition text-lg"
            >
              ↻ Transaksi Baru
            </button>
          </div>

          {/* Print Version */}
          <div className="hidden print:block" style={{ fontFamily: 'monospace', fontSize: '13px', padding: '24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '3px' }}>🅿️ BUKTI PARKIR</h1>
              <p style={{ fontSize: '10px', color: '#999' }}>Sistem Manajemen Parkir</p>
            </div>

            <hr style={{ borderTop: '2px solid #333', marginBottom: '15px' }} />

            <div style={{ marginBottom: '12px' }}>
              <p style={{ fontSize: '10px', color: '#999', marginBottom: '3px', fontWeight: 'bold' }}>PLAT NOMOR</p>
              <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#000' }}>{selectedTransaksi.plat_nomor}</p>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <p style={{ fontSize: '10px', color: '#999', marginBottom: '3px', fontWeight: 'bold' }}>JENIS KENDARAAN</p>
              <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#000' }}>{selectedTransaksi.nama_jenis}</p>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <p style={{ fontSize: '10px', color: '#999', marginBottom: '3px', fontWeight: 'bold' }}>AREA PARKIR</p>
              <p style={{ fontSize: '13px', color: '#000' }}>{selectedTransaksi.nama_area}</p>
            </div>

            <hr style={{ borderTop: '2px solid #333', margin: '15px 0' }} />

            <div style={{ marginBottom: '12px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#000' }}>
                <span>Masuk</span>
                <span>{formatJam(selectedTransaksi.waktu_masuk)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#000' }}>
                <span>Keluar</span>
                <span>{formatJam(selectedTransaksi.waktu_keluar)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#000' }}>
                <span>Durasi</span>
                <span>{selectedTransaksi.durasi_jam} jam</span>
              </div>
            </div>

            <div style={{ marginBottom: '12px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#000' }}>
                <span>Tarif</span>
                <span>Rp {selectedTransaksi.tarif_per_jam.toLocaleString('id-ID')}/jam</span>
              </div>
            </div>

            <hr style={{ borderTop: '2px solid #333', margin: '15px 0' }} />

            <div style={{ marginBottom: '12px', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#000', marginBottom: '4px' }}>
                <span style={{ fontWeight: 'bold' }}>Metode Bayar</span>
                <span style={{ fontWeight: 'bold' }}>{selectedTransaksi.metode_pembayaran === 'cash' ? 'CASH' : 'QRIS'}</span>
              </div>
            </div>

            {selectedTransaksi.metode_pembayaran === 'cash' && (
              <div style={{ marginBottom: '12px', fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: '#000' }}>
                  <span>Uang</span>
                  <span>Rp {(selectedTransaksi.uang_diterima || 0).toLocaleString('id-ID')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#000' }}>
                  <span>Kembalian</span>
                  <span>Rp {(selectedTransaksi.kembalian || 0).toLocaleString('id-ID')}</span>
                </div>
              </div>
            )}

            {selectedTransaksi.metode_pembayaran === 'qris' && (
              <div style={{ marginBottom: '12px', textAlign: 'center' }}>
                <p style={{ fontSize: '9px', color: '#999', marginBottom: '8px' }}>QRIS DANA</p>
                <img 
                  src="/qris-dana.png" 
                  alt="QRIS Dana" 
                  style={{ maxWidth: '150px', margin: '0 auto', borderRadius: '4px' }}
                />
                <p style={{ fontSize: '9px', color: '#999', marginTop: '4px' }}>+62 821 4194 5168</p>
              </div>
            )}

            <hr style={{ borderTop: '2px solid #333', margin: '15px 0' }} />

            <div style={{ backgroundColor: '#e8f5e9', padding: '12px', textAlign: 'center', marginBottom: '15px' }}>
              <p style={{ fontSize: '10px', color: '#666', marginBottom: '4px', fontWeight: 'bold' }}>TOTAL BAYAR</p>
              <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#00897b' }}>
                Rp {(selectedTransaksi.total_bayar || 0).toLocaleString('id-ID')}
              </p>
            </div>

            <hr style={{ borderTop: '2px solid #333', marginBottom: '15px' }} />

            <div style={{ textAlign: 'center', fontSize: '10px', color: '#999' }}>
              <p>Terima Kasih</p>
              <p>Semoga perjalanan Anda aman</p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
