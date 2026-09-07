import { PrismaClient, Role, Divisi, TipeGaji } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Capolista123', 10);

  const superadmin = await prisma.user.upsert({
    where: { email: 'admin@capolista.com' },
    update: {},
    create: {
      nama: 'Superadmin Capolista',
      email: 'admin@capolista.com',
      password: hashedPassword,
      role: Role.SUPERADMIN,
      divisi: Divisi.HR,
      levelAkses: 0,
      tipeGaji: TipeGaji.BULANAN,
      statusAktif: true,
    },
  });

  console.log({ superadmin });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
