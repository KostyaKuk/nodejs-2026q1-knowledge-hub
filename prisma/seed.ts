import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {

  await prisma.user.deleteMany();

  const users = await prisma.user.createMany({
    data: [
      {
        login: 'admin@knowledge.com',
        password: 'admin123',
        role: 'ADMIN',
      },
      {
        login: 'editor@knowledge.com',
        password: 'editor123',
        role: 'EDITOR',
      },
      {
        login: 'viewer@knowledge.com',
        password: 'viewer123',
        role: 'VIEWER',
      },
    ],
  });

console.log(`🌱 Seeding finished successfully. Created ${users.count} users.`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });