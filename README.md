# Aplikasi Parkir - Dokumentasi Lengkap

Sistem manajemen area parkir yang lengkap dengan fitur multi-role, manajemen transaksi, dan laporan real-time.

## 📋 Daftar Isi

1. [Setup & Instalasi](#setup--instalasi)
2. [Struktur Project](#struktur-project)
3. [Fitur Utama](#fitur-utama)
4. [Dokumentasi API](#dokumentasi-api)
5. [Panduan Pengguna](#panduan-pengguna)

---

## 🚀 Setup & Instalasi

### Prerequisites
- Node.js v16 atau lebih tinggi
- MySQL Server
- npm atau yarn

### Backend Setup

#### 1. Instalasi Dependencies
```bash
cd backend
npm install
```

#### 2. Setup Database MySQL
- Buka MySQL Client dan jalankan query di file `config/database-schema.sql`
- Atau gunakan command:
```bash
mysql -u root -p < backend/config/database-schema.sql
```

#### 3. Konfigurasi Environment
Edit file `.env`:
```
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=parkir_db
DB_PORT=3306

JWT_SECRET=your_secret_key_here_change_in_production
JWT_EXPIRE=7d
```

#### 4. Jalankan Server
```bash
npm run dev
```
Server akan berjalan di `http://localhost:5000`

### Frontend Setup

#### 1. Instalasi Dependencies
```bash
cd frontend
npm install
```

#### 2. Konfigurasi Environment
Edit file `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

#### 3. Jalankan Development Server
```bash
npm run dev
```
Aplikasi akan berjalan di `http://localhost:3000`

---

## 📁 Struktur Project

### Backend Structure
```
backend/
├── config/
│   ├── database.js          # Konfigurasi database MySQL
│   └── database-schema.sql  # Schema database
├── controllers/             # Logic aplikasi
│   ├── AuthController.js
│   ├── UserController.js
│   ├── KendaraanController.js
│   ├── AreaParkirController.js
│   └── TransaksiParkirController.js
├── middleware/              # Middleware Express
│   ├── authMiddleware.js    # JWT & role-based access
│   ├── errorHandler.js      # Error handling
│   └── logActivity.js       # Activity logging
├── models/                  # Database queries
│   ├── UserModel.js
│   ├── KendaraanModel.js
│   ├── AreaParkirModel.js
│   └── TransaksiParkirModel.js
├── routes/                  # API routes
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── kendaraanRoutes.js
│   ├── areaParkirRoutes.js
│   └── transaksiParkirRoutes.js
├── utils/                   # Helper functions
│   └── helpers.js
├── .env                     # Environment variables
├── package.json
└── index.js                 # Entry point
```

### Frontend Structure
```
frontend/
├── app/
│   ├── login/               # Halaman login
│   ├── admin/               # Admin dashboard
│   ├── petugas/             # Petugas dashboard
│   ├── owner/               # Owner dashboard
│   ├── page.tsx             # Home page
│   ├── layout.tsx
│   └── globals.css
├── components/              # React components
│   ├── ProtectedLayout.tsx  # Route protection
│   ├── DashboardHeader.tsx
│   └── AdminSidebar.tsx
├── lib/
│   ├── apiClient.ts         # Axios configuration
│   └── api.ts               # API functions
├── .env.local               # Environment variables
└── package.json
```

---

## ✨ Fitur Utama

### 1. Authentication & Authorization
- ✅ Login dengan username & password
- ✅ JWT token-based authentication
- ✅ Role-based access control (Admin, Petugas, Owner)
- ✅ Secure logout

### 2. Admin Dashboard
- ✅ CRUD User (Admin, Petugas, Owner)
- ✅ CRUD Area Parkir
- ✅ CRUD Kendaraan
- ✅ CRUD Tarif Parkir
- ✅ View Transaksi
- ✅ View Log Aktivitas

### 3. Petugas Dashboard
- ✅ Transaksi Kendaraan Masuk (Check-In)
- ✅ Transaksi Kendaraan Keluar (Check-Out)
- ✅ Lihat Status Area Parkir Real-time
- ✅ Cetak Struk Parkir
- ✅ Hitung Otomatis Biaya Parkir

### 4. Owner Dashboard
- ✅ Laporan Transaksi Harian
- ✅ Laporan Transaksi Bulanan
- ✅ Filter Laporan Custom (rentang tanggal)
- ✅ Lihat Total Pendapatan
- ✅ Export Data Transaksi

### 5. Database Management
- ✅ User Management (status aktif/nonaktif)
- ✅ Kendaraan (plat nomor, jenis, pemilik)
- ✅ Area Parkir (kapasitas, tarif, lokasi)
- ✅ Transaksi (masuk-keluar, durasi, biaya)
- ✅ Log Aktivitas User

---

## 📚 Dokumentasi API

Lihat file `backend/API-DOCUMENTATION.md` untuk dokumentasi lengkap API endpoints.

### Ringkasan Endpoint

#### Authentication
```
POST   /api/auth/login          # Login user
POST   /api/auth/logout         # Logout user
GET    /api/auth/profile        # Get profile user
```

#### User Management (Admin only)
```
GET    /api/users               # Get all users
GET    /api/users/:id           # Get user by ID
GET    /api/users/role/:role    # Get users by role
POST   /api/users               # Create user
PUT    /api/users/:id           # Update user
PUT    /api/users/:id/password  # Update password
DELETE /api/users/:id           # Delete user
```

#### Kendaraan (Admin only)
```
GET    /api/kendaraan           # Get all kendaraan
GET    /api/kendaraan/:id       # Get kendaraan by ID
GET    /api/kendaraan/plat/:platNomor
POST   /api/kendaraan           # Create kendaraan
PUT    /api/kendaraan/:id       # Update kendaraan
DELETE /api/kendaraan/:id       # Delete kendaraan
```

#### Area Parkir
```
GET    /api/area-parkir         # Get all area (Admin, Petugas)
GET    /api/area-parkir/:id     # Get area by ID
POST   /api/area-parkir         # Create area (Admin only)
PUT    /api/area-parkir/:id     # Update area (Admin only)
DELETE /api/area-parkir/:id     # Delete area (Admin only)
```

#### Transaksi Parkir
```
GET    /api/transaksi           # Get all transaksi
GET    /api/transaksi/:id       # Get transaksi by ID
POST   /api/transaksi/masuk     # Check-in kendaraan (Petugas only)
POST   /api/transaksi/keluar    # Check-out kendaraan (Petugas only)
GET    /api/transaksi/laporan/range   # Report by date range (Admin, Owner)
GET    /api/transaksi/laporan/area    # Report by area (Admin, Owner)
```

---

## 👥 Panduan Pengguna

### 1. Login

Akses aplikasi di `http://localhost:3000` dan gunakan akun uji coba:

| Role   | Username | Password    |
|--------|----------|-------------|
| Admin  | admin    | admin123    |
| Petugas| petugas  | petugas123  |
| Owner  | owner    | owner123    |

### 2. Admin Dashboard

#### Fitur-fitur:
1. **User Management** - Tambah/edit/hapus user
2. **Area Parkir** - Kelola area parkir (nama, kapasitas, harga)
3. **Kendaraan** - Register kendaraan baru
4. **Transaksi** - Monitor semua transaksi parkir
5. **Log Aktivitas** - Lihat riwayat aktivitas user

#### Tips:
- Gunakan tombol filter untuk mencari user/area tertentu
- Klik edit untuk mengubah data
- Hati-hati saat menghapus data (tidak bisa di-undo)

### 3. Petugas Dashboard

#### Fitur-fitur:
1. **Kendaraan Masuk** - Input plat nomor dan area parkir
2. **Kendaraan Keluar** - Input plat nomor untuk checkout
3. **Status Area** - Lihat kapasitas real-time setiap area

#### Cara Transaksi:

**Masuk:**
1. Input plat nomor (contoh: B 1234 ABC)
2. Pilih area parkir
3. Klik "Kendaraan Masuk"
4. Sistem akan mencatat waktu masuk

**Keluar:**
1. Input plat nomor yang keluar
2. Klik "Kendaraan Keluar"
3. Sistem otomatis hitung:
   - Durasi parkir
   - Total biaya berdasarkan tarif area
   - Tampilkan struk

### 4. Owner Dashboard

#### Fitur-fitur:
1. **Filter Laporan** - Pilih rentang tanggal
2. **Summary** - Total transaksi & total pendapatan
3. **Detail Transaksi** - Tabel lengkap setiap transaksi

#### Cara Menggunakan:
1. Pilih tanggal mulai dan tanggal akhir
2. Klik "Tampilkan Laporan"
3. Lihat summary di atas
4. Lihat detail di tabel bawah

---

## 🔒 Security & Best Practices

### Password Hashing
- Password di-hash menggunakan bcryptjs
- Salt rounds: 10
- Tidak menyimpan plain text password

### JWT Token
- Token expiration: 7 hari
- Secret key dapat diubah di `.env`
- Disimpan di browser cookies (secure)

### Role-Based Access Control
- Setiap endpoint dilindungi dengan middleware
- Middleware cek role user sebelum akses resource

### Input Validation
- Validasi di level controller
- Validasi format email, nomor telepon
- Validasi unique untuk username, plat nomor, nama area

### Error Handling
- Consistent error response format
- Error message yang user-friendly
- Tidak expose internal error details di production

---

## 🐛 Troubleshooting

### Backend tidak bisa connect ke database
**Solusi:**
1. Cek MySQL sudah running
2. Cek credential di `.env` (user, password, nama database)
3. Cek database sudah dibuat dengan schema

### Frontend tidak bisa call API
**Solusi:**
1. Cek backend sudah running (`http://localhost:5000`)
2. Cek URL di `.env.local` benar
3. Cek CORS configuration di backend

### Login gagal
**Solusi:**
1. Cek username & password benar
2. Cek user aktif (aktif = true)
3. Lihat console browser untuk error detail

### Token expired
**Solusi:**
1. Login ulang untuk dapatkan token baru
2. Token akan refresh otomatis setelah login

---

## 📱 Responsive Design

Aplikasi sudah responsive untuk:
- 📱 Mobile (< 768px)
- 💻 Tablet (768px - 1024px)
- 🖥️ Desktop (> 1024px)

---

## 🎓 Untuk Pembelajaran

Kode ini ditulis dengan clean code principles:
- ✅ Meaningful variable names
- ✅ Reusable components
- ✅ Modular structure
- ✅ Comments untuk logic kompleks
- ✅ Error handling yang proper

Cocok untuk:
- Belajar REST API dengan Express
- Belajar Next.js dengan TypeScript
- Belajar database design MySQL
- Belajar authentication & authorization
- Belajar full-stack development

---

## 📞 Kontak & Support

Jika ada pertanyaan atau issue:
1. Check API Documentation
2. Check console browser (F12)
3. Check terminal backend untuk error logs

---

**Happy Learning! 🚀**
