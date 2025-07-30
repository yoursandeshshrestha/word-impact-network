import { videoProcessingQueue } from '../config/queue';
import { logger } from '../utils/logger';
import { processVideoJob } from '../jobs/videoProcessing';

export const startVideoProcessor = () => {
  // Process video jobs
  videoProcessingQueue.process('process-video', processVideoJob);

  logger.info('Video processor started');
};

export const stopVideoProcessor = async () => {
  await videoProcessingQueue.close();
  logger.info('Video processor stopped');
};
