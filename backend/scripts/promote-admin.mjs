import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../dist/generated/prisma/client.js';

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error('Usage: npm run admin:promote -- user@example.com');
  process.exitCode = 1;
} else if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exitCode = 1;
} else {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      console.error(`No user found with email: ${email}`);
      process.exitCode = 1;
    } else {
      const adminRole = await prisma.role.upsert({
        where: { name: 'ADMIN' },
        create: { name: 'ADMIN' },
        update: {},
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { roleId: adminRole.id },
      });

      console.log(`Promoted ${email} to ADMIN`);
    }
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : 'Failed to promote user',
    );
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}
