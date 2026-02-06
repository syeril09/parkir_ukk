import Link from 'next/link';

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent">
            PARKIR
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-purple-50 flex items-center overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-sky-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Sistem Manajemen Parkir <span className="bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent">Cerdas</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Platform terintegrasi untuk mengelola area parkir dengan mudah dan efisien. Kelola user, kendaraan, transaksi, dan laporan dalam satu dashboard yang powerful.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/login"
                className="bg-gradient-to-r from-sky-600 to-purple-600 hover:from-sky-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl transition shadow-lg text-center text-lg"
              >
                Mulai Sekarang →
              </Link>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="hidden lg:flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="bg-gradient-to-br from-sky-400 to-purple-500 rounded-2xl p-8 shadow-2xl text-white">
                <div className="text-6xl mb-4">🚗</div>
                <h3 className="text-2xl font-bold mb-2">Smart Parking</h3>
                <p className="text-blue-100">Kelola parkir Anda dengan teknologi terdepan</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Fitur Unggulan</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Semua yang Anda butuhkan untuk mengelola area parkir secara profesional</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 rounded-xl border-2 border-gray-200 hover:border-sky-600 hover:shadow-lg transition bg-gradient-to-br from-blue-50 to-transparent">
              <div className="text-5xl mb-4 group-hover:scale-110 transition transform">👥</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Multi-Role</h3>
              <p className="text-gray-600">Admin, Petugas, dan Owner dengan akses sesuai peran masing-masing</p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-xl border-2 border-gray-200 hover:border-sky-600 hover:shadow-lg transition bg-gradient-to-br from-emerald-50 to-transparent">
              <div className="text-5xl mb-4 group-hover:scale-110 transition transform">💰</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Manajemen Transaksi</h3>
              <p className="text-gray-600">Catat masuk-keluar kendaraan dan hitung biaya otomatis dengan akurat</p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-xl border-2 border-gray-200 hover:border-sky-600 hover:shadow-lg transition bg-gradient-to-br from-violet-50 to-transparent">
              <div className="text-5xl mb-4 group-hover:scale-110 transition transform">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Laporan Lengkap</h3>
              <p className="text-gray-600">Rekap transaksi dengan filter tanggal dan analisis data yang detail</p>
            </div>

            {/* Feature 4 */}
            <div className="group p-8 rounded-xl border-2 border-gray-200 hover:border-sky-600 hover:shadow-lg transition bg-gradient-to-br from-orange-50 to-transparent">
              <div className="text-5xl mb-4 group-hover:scale-110 transition transform">🚗</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Database Kendaraan</h3>
              <p className="text-gray-600">Kelola data kendaraan dan berbagai jenis dengan sistem yang terstruktur</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="w-full py-20 px-6 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Keuntungan Menggunakan Aplikasi Kami</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Tingkatkan efisiensi dan transparansi operasional parkir Anda</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition">
              <div className="w-14 h-14 bg-sky-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Efisiensi Waktu</h3>
              <p className="text-gray-600">Proses cepat dan otomatis menghemat waktu operasional hingga 80%</p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition">
              <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Data Aman</h3>
              <p className="text-gray-600">Sistem keamanan berlapis melindungi semua data transaksi Anda</p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition">
              <div className="w-14 h-14 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Laporan Real-time</h3>
              <p className="text-gray-600">Pantau aktivitas parkir dan pendapatan secara real-time kapan saja</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 px-6 bg-gradient-to-r from-sky-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">Siap Memulai?</h2>
          <p className="text-xl text-blue-100 mb-8">Kelola area parkir Anda dengan sistem yang modern dan terpercaya</p>
          <Link
            href="/login"
            className="inline-block bg-white text-sky-600 hover:bg-gray-100 font-bold py-4 px-10 rounded-xl transition shadow-lg text-lg"
          >
            Login Sekarang →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-sky-400 to-purple-400 bg-clip-text text-transparent">PARKIR</h3>
              <p className="text-gray-400">Sistem manajemen parkir cerdas untuk operasional yang lebih baik</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Fitur</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Manajemen Transaksi</a></li>
                <li><a href="#" className="hover:text-white transition">Laporan Lengkap</a></li>
                <li><a href="#" className="hover:text-white transition">Dashboard</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Tentang</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Aplikasi Parkir v1.0</li>
                <li>Dibuat untuk Tugas UKK</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2026 Aplikasi Parkir. Semua hak dilindungi.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
