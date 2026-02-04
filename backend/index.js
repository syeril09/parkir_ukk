const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const kendaraanRoutes = require('./routes/kendaraanRoutes');
const areaParkirRoutes = require('./routes/areaParkirRoutes');
const transaksiParkirRoutes = require('./routes/transaksiParkirRoutes');
const logAktivitasRoutes = require('./routes/logAktivitasRoutes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const logActivity = require('./middleware/logActivity');

// Inisialisasi Express
const app = express();

// ============================================
// MIDDLEWARE
// ============================================

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000', // Sesuaikan dengan URL frontend
  credentials: true
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Activity logging middleware
app.use(logActivity);

// ============================================
// ROUTES
// ============================================

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Aplikasi Parkir Backend - API v1.0',
    version: '1.0.0'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server sedang berjalan'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/kendaraan', kendaraanRoutes);
app.use('/api/area-parkir', areaParkirRoutes);
app.use('/api/transaksi', transaksiParkirRoutes);
app.use('/api/log-aktivitas', logAktivitasRoutes);

// ============================================
// 404 HANDLER
// ============================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} tidak ditemukan`
  });
});

// ============================================
// ERROR HANDLER
// ============================================

app.use(errorHandler);

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║   APLIKASI PARKIR - BACKEND SERVER            ║
║   Server berjalan di http://localhost:${PORT}  ║
║   Environment: ${process.env.NODE_ENV}         ║
╚═══════════════════════════════════════════════╝
  `);
});
