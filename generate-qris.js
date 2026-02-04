const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// Link DANA yang baru - PASTIKAN LINK INI BARU DARI APLIKASI DANA!
const qrisData = 'https://link.dana.id/minta?full_url=https://qr.dana.id/v1/281012012024072391654262';

// Output path
const outputDir = path.join(__dirname, 'frontend', 'public');
const outputFile = path.join(outputDir, 'qris-dana.png');

// Buat folder jika belum ada
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate QR code
QRCode.toFile(outputFile, qrisData, {
  errorCorrectionLevel: 'H',
  type: 'image/png',
  width: 300,
  margin: 1,
  color: {
    dark: '#000000',
    light: '#FFFFFF'
  }
}, (err) => {
  if (err) {
    console.error('❌ Error generating QRIS:', err);
    process.exit(1);
  }
  console.log('✅ QRIS generated successfully!');
  console.log(`📍 File saved at: ${outputFile}`);
  console.log(`🔗 QRIS Data: ${qrisData}`);
  console.log('');
  console.log('📱 CARA SCAN:');
  console.log('1. Buka aplikasi DANA di ponsel');
  console.log('2. Pilih menu "Scan" atau "Pembayaran"');
  console.log('3. Scan QR code ini');
  console.log('4. Ikuti instruksi di aplikasi DANA');
});
