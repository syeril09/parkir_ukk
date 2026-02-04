const mysql = require('mysql2/promise');
require('dotenv').config();

// Buat pool connection ke database
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test koneksi database
pool.getConnection()
  .then(connection => {
    console.log('✓ Database terhubung berhasil');
    connection.release();
  })
  .catch(err => {
    console.error('✗ Gagal terhubung ke database:', err.message);
  });

module.exports = pool;
