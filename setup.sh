#!/bin/bash

# 🚀 SETUP SCRIPT - Aplikasi Parkir
# Script ini membantu setup project dengan mudah

echo "╔════════════════════════════════════════════════════════╗"
echo "║   Setup Aplikasi Parkir - UKK                          ║"
echo "║   Sistem Manajemen Area Parkir                         ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js
echo -e "${YELLOW}[1/5] Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js tidak terinstall${NC}"
    echo "Install Node.js dari: https://nodejs.org"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"
echo ""

# Check MySQL
echo -e "${YELLOW}[2/5] Checking MySQL...${NC}"
if ! command -v mysql &> /dev/null; then
    echo -e "${YELLOW}⚠ MySQL tidak found di PATH${NC}"
    echo "Pastikan MySQL Server sudah terinstall dan running"
else
    echo -e "${GREEN}✓ MySQL terinstall${NC}"
fi
echo ""

# Setup Backend
echo -e "${YELLOW}[3/5] Setting up Backend...${NC}"
cd backend
if [ -d "node_modules" ]; then
    echo "✓ Dependencies sudah terinstall"
else
    echo "Installing dependencies..."
    npm install
fi
echo -e "${GREEN}✓ Backend ready${NC}"
cd ..
echo ""

# Setup Frontend
echo -e "${YELLOW}[4/5] Setting up Frontend...${NC}"
cd frontend
if [ -d "node_modules" ]; then
    echo "✓ Dependencies sudah terinstall"
else
    echo "Installing dependencies..."
    npm install
fi
echo -e "${GREEN}✓ Frontend ready${NC}"
cd ..
echo ""

# Database Setup Instructions
echo -e "${YELLOW}[5/5] Database Setup${NC}"
echo "Jalankan salah satu command berikut untuk setup database:"
echo ""
echo -e "${GREEN}Option 1 (Recommended):${NC}"
echo "  mysql -u root -p < backend/config/database-schema.sql"
echo ""
echo -e "${GREEN}Option 2 (Manual):${NC}"
echo "  1. Buka MySQL Workbench atau MySQL CLI"
echo "  2. Run queries di: backend/config/database-schema.sql"
echo ""

# Summary
echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║   Setup Selesai! 🎉                                    ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}Next Steps:${NC}"
echo ""
echo "1. Setup Database (jika belum):"
echo "   mysql -u root -p < backend/config/database-schema.sql"
echo ""
echo "2. Run Backend (Terminal 1):"
echo "   cd backend && npm run dev"
echo "   → Will run on http://localhost:5000"
echo ""
echo "3. Run Frontend (Terminal 2):"
echo "   cd frontend && npm run dev"
echo "   → Will run on http://localhost:3000"
echo ""
echo -e "${GREEN}Test Akun:${NC}"
echo "   Admin:   admin / admin123"
echo "   Petugas: petugas / petugas123"
echo "   Owner:   owner / owner123"
echo ""
echo -e "${YELLOW}Dokumentasi:${NC}"
echo "   • README.md - Dokumentasi lengkap"
echo "   • QUICK-START.md - Quick start guide"
echo "   • backend/API-DOCUMENTATION.md - API docs"
echo "   • backend/TESTING-GUIDE.md - Testing guide"
echo ""
echo "Happy coding! 🚀"
