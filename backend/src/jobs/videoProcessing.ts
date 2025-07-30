import { Job } from 'bull';
import { logger } from '../utils/logger';
import { waitForVideoProcessing } from '../utils/vimeo';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface VideoProcessingJobData {
  videoId: string;
  vimeoId: string;
  title: string;
  chapterId: string;
}

export const processVideoJob = async (job: Job<VideoProcessingJobData>) => {
  const { videoId, vimeoId, title, chapterId } = job.data;

  try {
    logger.info('Starting video processing job', {
      jobId: job.id,
      videoId,
      vimeoId,
      title,
    });

    // Update job status to processing
    await prisma.video.update({
      where: { id: videoId },
      data: {
        status: 'PROCESSING',
        processingJobId: job.id.toString(),
      },
    });

    // Wait for video to be processed by Vimeo
    const embedUrl = await waitForVideoProcessing(vimeoId);

    // Update video with final embed URL and mark as ready
    await prisma.video.update({
      where: { id: videoId },
      data: {
        embedUrl,
        status: 'READY',
        processingJobId: null,
        processedAt: new Date(),
      },
    });

    logger.info('Video processing completed successfully', {
      jobId: job.id,
      videoId,
      vimeoId,
      embedUrl,
    });

    return { success: true, embedUrl };
  } catch (error) {
    logger.error('Video processing job failed', {
      jobId: job.id,
      videoId,
      vimeoId,
      error: error instanceof Error ? error.message : String(error),
    });

    // Update video status to failed
    await prisma.video.update({
      where: { id: videoId },
      data: {
        status: 'FAILED',
        processingJobId: null,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    throw error;
  }
};
