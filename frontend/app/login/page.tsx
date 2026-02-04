'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { authAPI } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validasi input
      if (!username || !password) {
        setError('Username dan password harus diisi');
        setLoading(false);
        return;
      }

      // Login ke API
      const response = await authAPI.login(username, password);

      if (response.success) {
        // Simpan token dan user data
        console.log('✅ Login successful:', response);
        Cookies.set('token', response.token, { expires: 7 });
        Cookies.set('user', JSON.stringify(response.user), { expires: 7 });
        
        console.log('🍪 Token saved:', Cookies.get('token')?.substring(0, 20));
        console.log('🍪 User saved:', Cookies.get('user'));

        // Redirect ke dashboard sesuai role
        const role = response.user.role;
        console.log('📍 Redirecting to:', `/${role}`);
        
        if (role === 'admin') {
          router.push('/admin');
        } else if (role === 'petugas') {
          router.push('/petugas');
        } else if (role === 'owner') {
          router.push('/owner');
        }
      } else {
        setError(response.message || 'Login gagal');
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || 'Terjadi kesalahan';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-600 via-sky-600 to-cyan-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-4xl">🅿️</span>
            <span className="bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent"> PARKIR</span>
          </h1>
          <p className="text-slate-600 font-medium">Sistem Manajemen Area Parkir</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg text-sm">
            <p className="font-semibold">⚠️ Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Username Input */}
          <div>
            <label htmlFor="username" className="block text-sm font-semibold text-slate-700 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-indigo-100 transition"
              disabled={loading}
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-indigo-100 transition"
              disabled={loading}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-sky-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-lg"
          >
            {loading ? 'Sedang login...' : 'Login'}
          </button>
        </form>

        {/* Register Link */}
        <div className="text-center mt-6">
          <p className="text-slate-600">
            Belum punya akun?{' '}
            <a
              href="/register"
              className="text-sky-600 hover:text-sky-800 font-semibold hover:underline transition"
            >
              Daftar di sini
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
