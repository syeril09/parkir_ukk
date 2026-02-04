import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-600 via-sky-600 to-cyan-600 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-sky-600 to-purple-700 px-8 py-12 text-center">
            <h1 className="text-5xl font-bold text-white mb-2">🅿️ PARKIR</h1>
            <p className="text-sky-100 text-lg">Sistem Manajemen Area Parkir Cerdas</p>
          </div>

          {/* Content */}
          <div className="px-8 py-12">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Selamat Datang! 👋</h2>
              <p className="text-slate-600 leading-relaxed">
                Aplikasi Parkir adalah sistem terintegrasi untuk mengelola area parkir dengan mudah dan efisien. Kelola user, kendaraan, area parkir, serta lacak semua transaksi parkir Anda dalam satu platform.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                <div className="text-3xl mb-2">👥</div>
                <h3 className="font-semibold text-blue-900 mb-2">Multi-Role</h3>
                <p className="text-sm text-blue-700">Admin, Petugas, dan Owner dengan akses sesuai peran</p>
              </div>

              <div className="bg-gradient-to-br from-sky-50 to-emerald-100 p-6 rounded-lg border border-sky-200">
                <div className="text-3xl mb-2">💰</div>
                <h3 className="font-semibold text-sky-900 mb-2">Manajemen Transaksi</h3>
                <p className="text-sm text-sky-700">Catat masuk-keluar kendaraan dan hitung otomatis biaya</p>
              </div>

              <div className="bg-gradient-to-br from-violet-50 to-violet-100 p-6 rounded-lg border border-violet-200">
                <div className="text-3xl mb-2">📊</div>
                <h3 className="font-semibold text-violet-900 mb-2">Laporan Lengkap</h3>
                <p className="text-sm text-violet-700">Rekap transaksi dengan filter tanggal yang fleksibel</p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
                <div className="text-3xl mb-2">🚗</div>
                <h3 className="font-semibold text-orange-900 mb-2">Database Kendaraan</h3>
                <p className="text-sm text-orange-700">Kelola data kendaraan dan berbagai jenis kendaraan</p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex gap-4 mb-8">
              <Link
                href="/login"
                className="flex-1 bg-gradient-to-r from-sky-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition text-center shadow-lg"
              >
                Mulai Login →
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-white">
          <p>Aplikasi Parkir v1.0 | Dibuat untuk Tugas UKK</p>
        </div>
      </div>
    </div>
  );
}
