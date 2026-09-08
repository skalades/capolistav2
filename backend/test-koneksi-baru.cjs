const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres.kmgyvgqafzozfymrgupl:capolista13@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true'
    }
  }
});

async function main() {
  try {
    await prisma.$connect();
    console.log('KONEKSI BERHASIL TERSAMBUNG KE SUPABASE!');
  } catch (err) {
    console.error('KONEKSI GAGAL:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
