import app from './app';
import config from './types';
import { PrismaClient } from '@prisma/client';
import { initializeSocketIO } from './websocket/websocket';

const prisma = new PrismaClient();
const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`
  🚀 Server running in ${config.env} mode
  🌐 URL: http://localhost:${PORT}
  📚 API docs: http://localhost:${PORT}${config.apiPrefix}/docs
  `);
});

// Initialize Socket.IO with the HTTP server
const io = initializeSocketIO(server);

// Make io available globally
(global as any).io = io;

// Function to gracefully close server and database connections
const gracefulShutdown = async (signal?: string) => {
  console.log(`\n${signal || 'Shutting down gracefully'} 🔄`);

  try {
    // Close server first (stop accepting new connections)
    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) reject(err);
        console.log('✅ HTTP server closed');
        resolve();
      });
    });

    // Then close database connections
    await prisma.$disconnect();
    console.log('✅ Database connections closed');

    console.log('👋 Graceful shutdown completed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during graceful shutdown:', err);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('❌ UNHANDLED REJECTION:', err.name, err.message);
  console.error(err.stack);
  gracefulShutdown('Unhandled Promise rejection detected');
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('❌ UNCAUGHT EXCEPTION:', err.name, err.message);
  console.error(err.stack);
  gracefulShutdown('Uncaught Exception detected');
});

// Handle SIGTERM signal (e.g., from Kubernetes)
process.on('SIGTERM', () => gracefulShutdown('SIGTERM received'));

// Handle SIGINT signal (e.g., Ctrl+C)
process.on('SIGINT', () => gracefulShutdown('SIGINT received'));
