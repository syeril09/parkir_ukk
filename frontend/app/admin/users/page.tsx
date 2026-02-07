'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import ProtectedLayout from '@/components/ProtectedLayout';
import Modal from '@/components/Modal';
import { userAPI } from '@/lib/api';

interface User {
  id: number;
  nama: string;
  username: string;
  email: string;
  role: string;
  aktif: number;
}

export default function ManajemenUserPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [usernameError, setUsernameError] = useState('');
  const [formData, setFormData] = useState({
    nama: '',
    username: '',
    email: '',
    role: '',
    password: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAll();
      setUsers(response.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memuat user');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({ nama: '', username: '', email: '', role: '', password: '' });
    setShowForm(true);
  };

  const handleEditClick = (user: User) => {
    setEditingId(user.id);
    setFormData({
      nama: user.nama,
      username: user.username,
      email: user.email,
      role: user.role,
      password: ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameError('');
    setError('');
    setSuccess('');

    // Validasi role terpilih
    if (!formData.role) {
      setError('Pilih role terlebih dahulu');
      return;
    }

    // Validasi username unik
    const usernameExists = users.some((user) => 
      user.username.toLowerCase() === formData.username.toLowerCase() &&
      user.id !== editingId // Jika edit, abaikan user yang sedang diedit
    );

    if (usernameExists) {
      setUsernameError('Username sudah digunakan. Pilih username lain.');
      return;
    }

    try {
      if (editingId) {
        await userAPI.update(editingId, formData);
        setSuccess('User berhasil diupdate');
      } else {
        await userAPI.create(formData);
        setSuccess('User berhasil ditambahkan');
      }
      setTimeout(() => {
        setShowForm(false);
        loadUsers();
        setUsernameError('');
        setError('');
        setSuccess('');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menyimpan user');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus user ini?')) return;
    try {
      await userAPI.delete(id);
      loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menghapus user');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ nama: '', username: '', email: '', role: 'petugas', password: '' });
  };

  return (
    <ProtectedLayout requiredRole="admin">
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader title="Manajemen User" role="admin" />
          <main className="flex-1 overflow-y-auto p-6">
            {/* Header */}
            <div className="mb-6 flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">Daftar User</h1>
              <button
                onClick={handleAddClick}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                + Tambah User
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
              title={editingId ? 'Edit User' : 'Tambah User Baru'}
              onClose={handleCancel}
              size="md"
            >
              {success && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
                  ✅ {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama
                      </label>
                      <input
                        type="text"
                        value={formData.nama}
                        onChange={(e) =>
                          setFormData({ ...formData, nama: e.target.value })
                        }
                        className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg text-slate-900 font-semibold placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Username <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => {
                          setFormData({ ...formData, username: e.target.value });
                          setUsernameError('');
                        }}
                        className={`w-full px-3 py-2 border-2 rounded-lg text-slate-900 font-semibold placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
                          usernameError ? 'border-red-500' : 'border-blue-300'
                        }`}
                        required
                      />
                      {usernameError && (
                        <p className="text-red-600 text-sm mt-1">⚠️ {usernameError}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg text-slate-900 font-semibold placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => {
                          setFormData({ ...formData, role: e.target.value });
                          setError('');
                        }}
                        className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        required
                      >
                        <option value="">-- Pilih Role --</option>
                        <option value="admin">Admin</option>
                        <option value="petugas">Petugas</option>
                        <option value="owner">Owner</option>
                      </select>
                    </div>
                    {!editingId && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Password
                        </label>
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({ ...formData, password: e.target.value })
                          }
                          className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg text-slate-900 font-semibold placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                          required
                        />
                      </div>
                    )}
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
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      {editingId ? 'Perbarui' : 'Tambah'} User
                    </button>
                  </div>
                </form>
            </Modal>

            {/* Users Table */}
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
                        Nama
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                        Username
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{user.nama}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{user.username}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              user.role === 'admin'
                                ? 'bg-red-100 text-red-800'
                                : user.role === 'owner'
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              user.aktif
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {user.aktif ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm space-x-2">
                          <button
                            onClick={() => handleEditClick(user)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <div className="text-center py-10 text-gray-600">
                    Belum ada user. Silakan tambah user baru.
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
