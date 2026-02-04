const https = require('https');
const fs = require('fs');
const path = require('path');

// Link Dana yang valid
const danaLink = 'https://link.dana.id/minta?full_url=https://qr.dana.id/v1/281012012024072391654262';

// Output path
const outputDir = path.join(__dirname, 'frontend', 'public');
const outputFile = path.join(outputDir, 'qris-dana.png');

// Create folder if not exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log('✅ Created folder:', outputDir);
}

// Generate QR code dari API
const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(danaLink)}&format=png`;

console.log('⏳ Generating QRIS image from Dana link...');
console.log('🔗 Dana Link:', danaLink);

https.get(qrApiUrl, (response) => {
  if (response.statusCode !== 200) {
    console.error('❌ Error:', response.statusCode);
    process.exit(1);
  }

  const fileStream = fs.createWriteStream(outputFile);
  response.pipe(fileStream);

  fileStream.on('finish', () => {
    fileStream.close();
    console.log('✅ QRIS image generated successfully!');
    console.log('📍 Saved to:', outputFile);
    console.log('✨ This QRIS is now scannable with Dana app!');
  });

  fileStream.on('error', (err) => {
    fs.unlink(outputFile, () => {}); // Delete the file if error
    console.error('❌ Error writing file:', err.message);
    process.exit(1);
  });
}).on('error', (err) => {
  console.error('❌ Network error:', err.message);
  process.exit(1);
});
