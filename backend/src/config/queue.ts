import Queue from 'bull';
import { logger } from '../utils/logger';

// Create Redis connection for Bull
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
};

// Create queues
export const videoProcessingQueue = new Queue('video-processing', {
  redis: redisConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 10,
    removeOnFail: 5,
  },
});

// Queue event handlers
videoProcessingQueue.on('error', (error: Error) => {
  logger.error('Video processing queue error:', error);
});

videoProcessingQueue.on('failed', (job: Queue.Job, error: Error) => {
  logger.error('Video processing job failed:', {
    jobId: job.id,
    videoId: job.data.videoId,
    error: error.message,
  });
});

videoProcessingQueue.on('completed', (job: Queue.Job) => {
  logger.info('Video processing job completed:', {
    jobId: job.id,
    videoId: job.data.videoId,
  });
});

export default {
  videoProcessingQueue,
};
