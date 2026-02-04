@echo off
REM 🚀 SETUP SCRIPT - Aplikasi Parkir (Windows)
REM Script ini membantu setup project dengan mudah

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║   Setup Aplikasi Parkir - UKK                          ║
echo ║   Sistem Manajemen Area Parkir                         ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Check Node.js
echo [1/5] Checking Node.js...
node -v >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js tidak terinstall
    echo Install Node.js dari: https://nodejs.org
    pause
    exit /b 1
)
echo ✓ Node.js terinstall
echo.

REM Setup Backend
echo [2/5] Setting up Backend...
cd backend
if exist "node_modules" (
    echo ✓ Dependencies sudah terinstall
) else (
    echo Installing dependencies...
    call npm install
)
cd ..
echo ✓ Backend ready
echo.

REM Setup Frontend
echo [3/5] Setting up Frontend...
cd frontend
if exist "node_modules" (
    echo ✓ Dependencies sudah terinstall
) else (
    echo Installing dependencies...
    call npm install
)
cd ..
echo ✓ Frontend ready
echo.

REM Database Setup Instructions
echo [4/5] Database Setup
echo Jalankan salah satu command berikut untuk setup database:
echo.
echo Option 1 (Recommended):
echo   mysql -u root -p ^< backend/config/database-schema.sql
echo.
echo Option 2 (Manual):
echo   1. Buka MySQL Workbench atau MySQL CLI
echo   2. Run queries di: backend/config/database-schema.sql
echo.

REM Summary
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║   Setup Selesai! 🎉                                    ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo Next Steps:
echo.
echo 1. Setup Database (jika belum):
echo    mysql -u root -p ^< backend/config/database-schema.sql
echo.
echo 2. Run Backend (Terminal 1):
echo    cd backend ^&^& npm run dev
echo    → Will run on http://localhost:5000
echo.
echo 3. Run Frontend (Terminal 2):
echo    cd frontend ^&^& npm run dev
echo    → Will run on http://localhost:3000
echo.
echo Test Akun:
echo    Admin:   admin / admin123
echo    Petugas: petugas / petugas123
echo    Owner:   owner / owner123
echo.
echo Dokumentasi:
echo    • README.md - Dokumentasi lengkap
echo    • QUICK-START.md - Quick start guide
echo    • backend/API-DOCUMENTATION.md - API docs
echo    • backend/TESTING-GUIDE.md - Testing guide
echo.
echo Happy coding! 🚀
echo.
pause
