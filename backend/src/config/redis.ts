import { createClient, RedisClientType } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env;

console.log(`Attempting to connect to Redis at ${REDIS_HOST}:${REDIS_PORT}`);

// Define the Redis client with explicit typing
const redisClient: RedisClientType = createClient({
  url: REDIS_PASSWORD
    ? `redis://:${REDIS_PASSWORD}@${REDIS_HOST || 'localhost'}:${REDIS_PORT || '6379'}`
    : `redis://${REDIS_HOST || 'localhost'}:${REDIS_PORT || '6379'}`,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 3) {
        console.log('Max Redis reconnection attempts reached, giving up');
        return false; // stop reconnecting
      }
      return Math.min(retries * 500, 3000); // reconnect after increasing delay
    },
  },
});

let redisConnected = false;

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
  if (redisConnected) {
    redisConnected = false;
    console.log('Redis connection lost. Caching features will not work.');
  } else {
    console.log(
      'Warning: Application will continue without Redis connection. Caching features will not work.',
    );
  }
});

redisClient.on('connect', () => {
  redisConnected = true;
});

export const connectRedis = async (): Promise<void> => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    console.error('Unable to connect to Redis:', error);
    // Continue without Redis in development mode
  }
};

export default redisClient;
