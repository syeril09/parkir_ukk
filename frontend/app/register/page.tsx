'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface RegisterFormData {
  nama: string;
  username: string;
  password: string;
  confirmPassword: string;
  role: 'admin' | 'owner' | 'petugas';
  email: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterFormData>({
    nama: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'petugas',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validasi form
      if (!formData.nama || !formData.username || !formData.password || !formData.role) {
        setError('Semua field wajib diisi');
        setLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Password dan konfirmasi password tidak cocok');
        setLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setError('Password minimal 6 karakter');
        setLoading(false);
        return;
      }

      // Kirim request ke API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nama: formData.nama,
          username: formData.username,
          password: formData.password,
          role: formData.role,
          email: formData.email
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registrasi gagal');
      }

      setSuccess('Registrasi berhasil! Mengalihkan ke dashboard...');

      // Simpan token ke localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      // Redirect berdasarkan role
      setTimeout(() => {
        switch (data.user.role) {
          case 'admin':
            router.push('/admin/dashboard');
            break;
          case 'owner':
            router.push('/owner/dashboard');
            break;
          case 'petugas':
            router.push('/petugas/dashboard');
            break;
          default:
            router.push('/login');
        }
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat registrasi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-2xl">👤</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Registrasi Akun Baru
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sistem Manajemen Parkir
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white py-8 px-6 shadow-lg rounded-lg space-y-4">
            {/* Error Message */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                {success}
              </div>
            )}

            {/* Nama */}
            <div>
              <label htmlFor="nama" className="block text-sm font-medium text-gray-700">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                id="nama"
                name="nama"
                type="text"
                required
                value={formData.nama}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Masukkan nama lengkap"
              />
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Masukkan username"
              />
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                id="role"
                name="role"
                required
                value={formData.role}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="petugas">👷 Petugas Parkir</option>
                <option value="owner">👨‍💼 Owner/Pemilik</option>
                <option value="admin">⚙️ Administrator</option>
              </select>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Masukkan email (opsional)"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Minimal 6 karakter"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Konfirmasi Password <span className="text-red-500">*</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ulangi password"
              />
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? '⏳ Mendaftarkan...' : '📝 Daftar Akun'}
              </button>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Sudah punya akun?{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Masuk di sini
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}