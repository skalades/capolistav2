const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:capolista13@db.gqifislfgdxowccjbwnx.supabase.co:5432/postgres'
    }
  }
});

async function main() {
  try {
    await prisma.$connect();
    console.log('KONEKSI BERHASIL!');
  } catch (err) {
    console.error('KONEKSI GAGAL:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
