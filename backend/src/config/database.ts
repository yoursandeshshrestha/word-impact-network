import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const { DATABASE_URL } = process.env;
console.log(`Attempting to connect to PostgreSQL at ${DATABASE_URL?.split('@')[1]?.split('/')[0]}`);

const prisma = new PrismaClient();

export const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    console.log(
      'Warning: Application will continue without database connection. Some features may not work.',
    );
    // Don't exit the process in development mode
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

export default prisma;
