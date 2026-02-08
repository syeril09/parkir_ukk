# PANDUAN SETUP & PERBAIKAN

## Perbaikan yang Sudah Dilakukan

### 1. Backend - Area Deletion Fix (✅ Done)
- **File**: `backend/controllers/AreaParkirController.js`
- **Perbaikan**: Method DELETE sekarang:
  - Cek transaksi aktif (status='parkir') - jika ada, reject dengan pesan informatif
  - Hapus transaksi yang sudah selesai
  - Hapus tarif terkait area
  - Baru hapus area
  
Hasilnya: **Deletion akan berhasil KECUALI ada kendaraan yang masih parkir di area tersebut**

### 2. Frontend - Simplified Form (✅ Done)  
- **File**: `frontend/app/admin/area/page.tsx`
- **Simplifikasi**: Form sekarang hanya punya:
  - Nama Area (text)
  - Jenis Kendaraan (typed input dengan autocomplete)
  - Lokasi (text)
  - Kapasitas (number)
  - Harga Per Jam (number)

Tidak ada select tiga kategori (mobil/bus/motor) lagi - kategori diturunkan otomatis dari jenis yang diketik.

### 3. Backend - Jenis Mapping (✅ Done)
- **File**: `backend/controllers/AreaParkirController.js`
- **Logic**: Ketika user mengetik jenis kendaraan (misal "Truk"):
  - Jika mengandung "motor"/"sepeda" → jenis_area = "motor"
  - Jika mengandung "bus" → jenis_area = "bus"  
  - Selainnya (Mobil, Truk, Avanza, dll) → jenis_area = "mobil"
  - Data jenis kendaraan disimpan terpisah di tabel jenis_kendaraan (bukan jenis_area)

**Catatan**: "Truk" akan menghasilkan jenis_area="mobil" (ini benar, karena truk adalah kategori 4-roda seperti mobil). Tapi data "Truk" tetap tersimpan di jenis_kendaraan table.

---

## SETUP YANG DIPERLUKAN DARI ANDA

### Step 1: Pastikan MySQL Running
```cmd
# Cek MySQL di Windows
mysql --version
```

### Step 2: Buat Database & Apply Schema
```cmd
# Login ke MySQL
mysql -u root

# Buat database
CREATE DATABASE IF NOT EXISTS db_parkir1;
USE db_parkir1;

# Exit
exit

# Apply schema
mysql -u root < backend/config/database-schema.sql
```

### Step 3: Seed Data Awal (Jenis Kendaraan)
```cmd
cd backend
node config/seed.js
```

### Step 4: Jalankan Backend
```cmd
cd backend
npm run dev
```

Server akan start di http://localhost:5000

### Step 5: Jalankan Frontend (terminal baru)
```cmd
cd frontend
npm run dev
```

Server akan start di http://localhost:3000

---

## TROUBLESHOOTING

### Kalau Backend tidak jalan:
1. Pastikan MySQL running
2. Cek `.env` file di `backend/`:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=    (biarkan kosong jika tidak ada password)
   DB_NAME=db_parkir1
   ```

### Kalau deletion masih error:
1. Pastikan database sudah created
2. Pastikan schema sudah applied
3. Jika ada error "no kendaraan aktif", berarti masih ada transaksi aktif untuk area ituLapor keluar semua kendaraan di area tersebut dulu

### Kalau Truk masih muncul sebagai Mobil:
- Itu adalah benar! "Truk" adalah tipe kendaraan 4-roda, kategorinya "Mobil"
- Tapi data "Truk" tetap tersimpan dengan benar di database

---

## VERIFIKASI

Setelah setup, coba:
1. Buka Admin → Kelola Area Parkir
2. Klik "Tambah Area"
3. Input:
   - Nama Area: "Area Truk"
   - Jenis Kendaraan: Ketik "Truk" (pilih dari suggestion atau biarkan)
   - Lokasi: "Lokasi 1"
   - Kapasitas: 20
   - Harga: 10000
4. Klik Simpan
5. Harusnya area muncul dengan label "Mobil" (karena kategori) tapi dengan data Truk yang tersimpan

Kalau ingin delete area, pastikan tidak ada transaksi aktif di area itu dulu.

---

## FILES YANG SUDAH DIUBAH

- ✅ `backend/controllers/AreaParkirController.js` - Delete logic & jenis mapping
- ✅ `frontend/app/admin/area/page.tsx` - Hapus emoji, simplify form
- ✅ `backend/models/TarifParkirModel.js` - Add deleteByArea method (sudah ada)
- ✅ `backend/models/AreaParkirModel.js` - Delete method (sudah ada)
