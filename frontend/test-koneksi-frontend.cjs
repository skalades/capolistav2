require('fs');
require('path');

async function testConnection() {
  console.log("==========================================");
  console.log("   TEST KONEKSI FRONTEND KE BACKEND");
  console.log("==========================================\n");

  const envPath = require('path').resolve(process.cwd(), '.env');
  let envVars = {};
  try {
    const envContent = require('fs').readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        envVars[match[1].trim()] = match[2].trim().replace(/['"]/g, '');
      }
    });
    console.log("✅ File .env ditemukan dan berhasil dibaca.");
  } catch (error) {
    console.log("⚠️ File .env tidak ditemukan, menggunakan nilai default.");
  }

  const internalUrl = process.env.INTERNAL_API_URL || envVars['INTERNAL_API_URL'] || 'http://127.0.0.1:3005';
  const publicUrl = process.env.NEXT_PUBLIC_API_URL || envVars['NEXT_PUBLIC_API_URL'] || 'http://127.0.0.1:3005';

  console.log(`\n🔍 INTERNAL_API_URL: ${internalUrl}`);
  console.log(`🔍 NEXT_PUBLIC_API_URL: ${publicUrl}\n`);

  const urlsToTest = [
    { name: "INTERNAL (Server Action)", url: internalUrl },
    { name: "PUBLIC (Client Fetch)", url: publicUrl }
  ];

  for (const { name, url } from urlsToTest) {
    console.log(`⏳ Mengetes koneksi ke ${name} (${url})...`);
    const startTime = Date.now();
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      const duration = Date.now() - startTime;
      
      if (response.ok) {
        console.log(`✅ BERHASIL! (HTTP ${response.status}) - ${duration}ms`);
      } else {
        console.log(`⚠️ TERHUBUNG, tapi HTTP Status: ${response.status} - ${duration}ms`);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`❌ GAGAL! (${duration}ms)`);
      if (error.name === 'TimeoutError' || error.code === 'ETIMEDOUT') {
        console.log(`   Penyebab: KONEKSI TIMEOUT (ETIMEDOUT). Server tidak dapat menjangkau alamat tersebut.`);
      } else if (error.code === 'ECONNREFUSED') {
        console.log(`   Penyebab: KONEKSI DITOLAK (ECONNREFUSED). Port kosong atau tertutup firewall.`);
      } else {
        console.log(`   Penyebab: ${error.message || error.code}`);
      }
    }
    console.log("------------------------------------------");
  }
}

testConnection();
