import { logger } from './logger';
import { AppError, ErrorTypes } from './appError';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import { createReadStream } from 'fs';
import { pipeline } from 'stream/promises';

// Validate required environment variables
const requiredEnvVars = [
  'BUNNY_STORAGE_ZONE_NAME',
  'BUNNY_STORAGE_PASSWORD',
  'BUNNY_STORAGE_HOSTNAME',
  'BUNNY_CDN_URL',
];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new AppError(
    `Missing required Bunny environment variables: ${missingEnvVars.join(', ')}`,
    500,
    ErrorTypes.SERVER,
  );
}

// Bunny configuration
const BUNNY_CONFIG = {
  storageZoneName: process.env.BUNNY_STORAGE_ZONE_NAME!,
  password: process.env.BUNNY_STORAGE_PASSWORD!,
  hostname: process.env.BUNNY_STORAGE_HOSTNAME!,
  cdnUrl: process.env.BUNNY_CDN_URL!,
  storageBaseUrl: `https://${process.env.BUNNY_STORAGE_HOSTNAME}/${process.env.BUNNY_STORAGE_ZONE_NAME}`,
};

interface BunnyUploadResult {
  success: boolean;
  storageUrl: string;
  cdnUrl: string;
  fileName: string;
  filePath: string;
}

/**
 * Helper to generate a safe, unique filename for Bunny
 */
function generateSafeFileName(originalName?: string): string {
  const uuid = randomUUID().replace(/-/g, '');

  if (!originalName) {
    return `video_${uuid}.mp4`;
  }

  try {
    const base = originalName.split('/').pop()?.split('\\').pop() || originalName;
    const nameWithoutExt = base.replace(/\.[^/.]+$/, '');
    const extension = base.split('.').pop()?.toLowerCase() || 'mp4';

    // Sanitize: Only keep letters, numbers, and hyphens
    const sanitized = nameWithoutExt.replace(/[^a-zA-Z0-9-]/g, '-').substring(0, 20);

    return sanitized ? `${sanitized}-${uuid}.${extension}` : `video_${uuid}.${extension}`;
  } catch (error) {
    logger.warn('Error generating safe filename, using UUID', {
      originalName,
      error: error instanceof Error ? error.message : String(error),
    });
    return `video_${uuid}.mp4`;
  }
}

/**
 * Sanitize folder path for Bunny
 */
function sanitizeFolderPath(folder: string): string {
  if (!folder) return 'videos';

  const sanitizedParts = folder
    .trim()
    .replace(/^\/+|\/+$/g, '')
    .split('/')
    .map((segment) => {
      return segment
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
    })
    .filter((segment) => segment.length > 0);

  return sanitizedParts.join('/') || 'videos';
}

/**
 * Upload file to Bunny Storage using streaming
 */
async function uploadToBunnyStorage(
  filePath: string,
  fileName: string,
  folderPath: string,
): Promise<BunnyUploadResult> {
  const fullPath = `${folderPath}/${fileName}`;
  const storageUrl = `${BUNNY_CONFIG.storageBaseUrl}/${fullPath}`;
  const cdnUrl = `${BUNNY_CONFIG.cdnUrl}/${fullPath}`;

  logger.info('Uploading to Bunny Storage', {
    storageUrl,
    cdnUrl,
    fileName,
    filePath,
  });

  try {
    const fileStream = createReadStream(filePath);
    const fileSize = fs.statSync(filePath).size;

    const response = await fetch(storageUrl, {
      method: 'PUT',
      headers: {
        AccessKey: BUNNY_CONFIG.password,
        'Content-Type': 'application/octet-stream',
        'Content-Length': fileSize.toString(),
      },
      body: fileStream,
      duplex: 'half',
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Bunny Storage upload failed', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        storageUrl,
        cdnUrl,
        storageZone: BUNNY_CONFIG.storageZoneName,
        hostname: BUNNY_CONFIG.hostname,
      });
      throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
    }

    logger.info('Upload successful', {
      storageUrl,
      cdnUrl,
      fileName,
      fileSize,
    });

    return {
      success: true,
      storageUrl,
      cdnUrl,
      fileName,
      filePath: fullPath,
    };
  } catch (error) {
    logger.error('Error uploading to Bunny Storage', {
      error: error instanceof Error ? error.message : String(error),
      fileName,
      folderPath,
      storageUrl,
      cdnUrl,
      storageZone: BUNNY_CONFIG.storageZoneName,
      hostname: BUNNY_CONFIG.hostname,
    });
    throw error;
  }
}

/**
 * Main upload function to Bunny
 * @param filePath The path to the file to upload
 * @param folder The folder to upload to (optional)
 * @param fileName The original filename (optional)
 * @returns The Bunny CDN URL for serving the file
 */
export const uploadToBunny = async (
  filePath: string,
  folder?: string,
  fileName?: string,
): Promise<string> => {
  try {
    const safeFolder = folder ? sanitizeFolderPath(folder) : 'videos';
    const safeFileName = generateSafeFileName(fileName);

    logger.info('Starting file upload to Bunny', {
      filePath,
      safeFolder,
      safeFileName,
    });

    const result = await uploadToBunnyStorage(filePath, safeFileName, safeFolder);

    logger.info('File uploaded successfully to Bunny', {
      fileName: result.fileName,
      cdnUrl: result.cdnUrl,
    });

    // Return the CDN URL for serving the file
    return result.cdnUrl;
  } catch (error) {
    logger.error('Error uploading file to Bunny', {
      error: error instanceof Error ? error.message : String(error),
      filePath,
      folder,
      fileName,
    });
    throw new AppError('Failed to upload file to Bunny', 500, ErrorTypes.SERVER);
  }
};

/**
 * Delete a file from Bunny Storage
 * @param fileUrl The CDN URL of the file to delete
 */
export const deleteFromBunny = async (fileUrl: string): Promise<void> => {
  try {
    // Extract the file path from the CDN URL
    const filePath = fileUrl.replace(BUNNY_CONFIG.cdnUrl + '/', '');
    const storageUrl = `${BUNNY_CONFIG.storageBaseUrl}/${filePath}`;

    logger.info('Deleting file from Bunny Storage', { filePath, storageUrl });

    const response = await fetch(storageUrl, {
      method: 'DELETE',
      headers: {
        AccessKey: BUNNY_CONFIG.password,
      },
    });

    if (!response.ok && response.status !== 404) {
      const errorText = await response.text();
      throw new Error(`Delete failed with status ${response.status}: ${errorText}`);
    }

    logger.info('File deleted successfully from Bunny Storage', { filePath });
  } catch (error) {
    logger.error('Error deleting file from Bunny Storage', {
      fileUrl,
      error: error instanceof Error ? error.message : String(error),
    });
    // We don't throw an error here to prevent blocking other operations
  }
};

/**
 * Check if a file exists in Bunny Storage
 */
export const checkFileExists = async (fileUrl: string): Promise<boolean> => {
  try {
    const filePath = fileUrl.replace(BUNNY_CONFIG.cdnUrl + '/', '');
    const storageUrl = `${BUNNY_CONFIG.storageBaseUrl}/${filePath}`;

    const response = await fetch(storageUrl, {
      method: 'HEAD',
      headers: {
        AccessKey: BUNNY_CONFIG.password,
      },
    });

    return response.ok;
  } catch (error) {
    logger.error('Error checking file existence in Bunny Storage', {
      fileUrl,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
};
