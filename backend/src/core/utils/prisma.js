import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('CRITICAL: DATABASE_URL is missing from your .env file!');
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });

export const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

export const disconnectPrisma = async () => {
  await prisma.$disconnect();
};
