import { logger } from './logger';
import { AppError, ErrorTypes } from './appError';
import { randomUUID } from 'crypto';

// Validate required environment variables
const requiredEnvVars = [
  'BUNNY_STORAGE_ZONE_NAME',
  'BUNNY_STORAGE_PASSWORD',
  'BUNNY_STORAGE_HOSTNAME',
];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new AppError(
    `Missing required Bunny CDN environment variables: ${missingEnvVars.join(', ')}`,
    500,
    ErrorTypes.SERVER,
  );
}

// Bunny CDN configuration
const BUNNY_CONFIG = {
  storageZoneName: process.env.BUNNY_STORAGE_ZONE_NAME!, // Should be "test-win"
  password: process.env.BUNNY_STORAGE_PASSWORD!, // Your storage password
  hostname: process.env.BUNNY_STORAGE_HOSTNAME!, // sg.storage.bunnycdn.com
  cdnUrl: process.env.BUNNY_CDN_URL || `https://test-win-pull.b-cdn.net`, // Your pull zone URL
};

// Size threshold for large files (50MB) - reduced from 100MB
const CHUNKED_UPLOAD_THRESHOLD = 50 * 1024 * 1024;

interface BunnyUploadResult {
  success: boolean;
  url: string;
  fileName: string;
  filePath: string;
}

/**
 * Helper to generate a safe, unique filename for Bunny CDN
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
 * Sanitize folder path for Bunny CDN
 */
function sanitizeFolderPath(folder: string): string {
  if (!folder) return 'videos';

  const sanitizedParts = folder
    .trim()
    .replace(/^\/+|\/+$/g, '') // Remove leading/trailing slashes
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
 * Upload file to Bunny CDN using direct API
 */
async function uploadToBunnyCDN(
  buffer: Buffer,
  fileName: string,
  folderPath: string,
): Promise<BunnyUploadResult> {
  const fullPath = `${folderPath}/${fileName}`;
  const url = `https://${BUNNY_CONFIG.hostname}/${BUNNY_CONFIG.storageZoneName}/${fullPath}`;

  logger.info('Uploading to Bunny CDN', {
    url,
    fileName,
    fileSize: buffer.length,
    headers: {
      AccessKey: BUNNY_CONFIG.password.substring(0, 8) + '...', // Log partial key for debugging
    },
  });

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        AccessKey: BUNNY_CONFIG.password,
        'Content-Type': 'application/octet-stream',
      },
      body: buffer,
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('Bunny CDN upload failed', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        url,
      });
      throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
    }

    const cdnUrl = `${BUNNY_CONFIG.cdnUrl}/${fullPath}`;

    logger.info('Upload successful', {
      cdnUrl,
      fileName,
      fileSize: buffer.length,
    });

    return {
      success: true,
      url: cdnUrl,
      fileName,
      filePath: fullPath,
    };
  } catch (error) {
    logger.error('Error uploading to Bunny CDN', {
      error: error instanceof Error ? error.message : String(error),
      fileName,
      folderPath,
      url,
    });
    throw error;
  }
}

/**
 * Upload file in chunks for large files
 * Note: Bunny CDN doesn't support traditional chunked uploads like this
 * We'll use the regular upload method but with proper error handling
 */
async function uploadLargeFileToBunnyCDN(
  buffer: Buffer,
  fileName: string,
  folderPath: string,
): Promise<BunnyUploadResult> {
  logger.info('Uploading large file to Bunny CDN', {
    fileName,
    fileSize: buffer.length,
  });

  // For large files, we still use the standard upload method
  // Bunny CDN handles large files automatically
  return await uploadToBunnyCDN(buffer, fileName, folderPath);
}

/**
 * Main upload function to Bunny CDN
 * @param file The file buffer to upload
 * @param folder The folder to upload to (optional)
 * @param fileName The original filename (optional)
 * @returns The Bunny CDN URL
 */
export const uploadToBunny = async (
  file: Buffer,
  folder?: string,
  fileName?: string,
): Promise<string> => {
  try {
    const safeFolder = folder ? sanitizeFolderPath(folder) : 'videos';
    const safeFileName = generateSafeFileName(fileName);

    logger.info('Starting file upload to Bunny CDN', {
      fileSize: file.length,
      safeFolder,
      safeFileName,
    });

    let result: BunnyUploadResult;

    // Use chunked upload for large files
    if (file.length > CHUNKED_UPLOAD_THRESHOLD) {
      logger.info('Using chunked upload method', { fileSize: file.length });
      result = await uploadLargeFileToBunnyCDN(file, safeFileName, safeFolder);
    } else {
      result = await uploadToBunnyCDN(file, safeFileName, safeFolder);
    }

    logger.info('File uploaded successfully to Bunny CDN', {
      fileName: result.fileName,
      url: result.url,
      fileSize: file.length,
    });

    return result.url;
  } catch (error) {
    logger.error('Error uploading file to Bunny CDN', {
      error: error instanceof Error ? error.message : String(error),
      fileSize: file.length,
      folder,
      fileName,
    });
    throw new AppError('Failed to upload file to Bunny CDN', 500, ErrorTypes.SERVER);
  }
};

/**
 * Delete a file from Bunny CDN
 * @param filePath The full path of the file to delete (from the URL)
 */
export const deleteFromBunny = async (fileUrl: string): Promise<void> => {
  try {
    // Extract the file path from the CDN URL
    const cdnBaseUrl = BUNNY_CONFIG.cdnUrl;
    const filePath = fileUrl.replace(cdnBaseUrl + '/', '');

    logger.info('Deleting file from Bunny CDN', { filePath });

    const url = `https://${BUNNY_CONFIG.hostname}/${BUNNY_CONFIG.storageZoneName}/${filePath}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        AccessKey: BUNNY_CONFIG.password,
      },
    });

    if (!response.ok && response.status !== 404) {
      const errorText = await response.text();
      throw new Error(`Delete failed with status ${response.status}: ${errorText}`);
    }

    logger.info('File deleted successfully from Bunny CDN', { filePath });
  } catch (error) {
    logger.error('Error deleting file from Bunny CDN', {
      fileUrl,
      error: error instanceof Error ? error.message : String(error),
    });
    // We don't throw an error here to prevent blocking other operations
  }
};

/**
 * Check if a file exists in Bunny CDN
 */
export const checkFileExists = async (fileUrl: string): Promise<boolean> => {
  try {
    const cdnBaseUrl = BUNNY_CONFIG.cdnUrl;
    const filePath = fileUrl.replace(cdnBaseUrl + '/', '');

    const url = `https://${BUNNY_CONFIG.hostname}/${BUNNY_CONFIG.storageZoneName}/${filePath}`;

    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        AccessKey: BUNNY_CONFIG.password,
      },
    });

    return response.ok;
  } catch (error) {
    logger.error('Error checking file existence in Bunny CDN', {
      fileUrl,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
};
