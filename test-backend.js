const http = require('http');

async function testBackend() {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/check',
    method: 'GET'
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(3000);
    req.end();
  });
}

async function main() {
  console.log('🔍 Testing Backend Server...\n');
  
  for (let i = 0; i < 5; i++) {
    try {
      const result = await testBackend();
      console.log(`✅ Backend is running on port 5000`);
      console.log(`   Status: ${result.status}`);
      return;
    } catch (err) {
      console.log(`⏳ Attempt ${i + 1}/5: Server not ready yet...`);
      if (i < 4) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }
  
  console.log('⚠️  Backend server not responding on port 5000');
  process.exit(1);
}

main();
