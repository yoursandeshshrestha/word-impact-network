import { v2 as cloudinary } from 'cloudinary';
import { logger } from './logger';
import { AppError, ErrorTypes } from './appError';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

// Validate required environment variables
const requiredEnvVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new AppError(
    `Missing required Cloudinary environment variables: ${missingEnvVars.join(', ')}`,
    500,
    ErrorTypes.SERVER,
  );
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Size threshold for large files (30MB)
const LARGE_FILE_THRESHOLD = 30 * 1024 * 1024;

interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  resource_type: string;
  // Add other properties if needed
}

/**
 * Helper to generate a safe, unique filename for Cloudinary
 * Uses only letters and includes UUID for uniqueness
 */
function generateSafeFileName(originalName?: string): string {
  // Create a UUID and remove dashes to use as unique identifier
  const uuid = randomUUID().replace(/-/g, '');

  if (!originalName) {
    return `file${uuid}`;
  }

  try {
    // Extract just the base name without extension or paths
    const base = originalName.split('/').pop()?.split('\\').pop() || originalName;
    const nameWithoutExt = base.replace(/\.[^/.]+$/, '');

    // Sanitize: Only keep letters (a-z, A-Z)
    const lettersOnly = nameWithoutExt.replace(/[^a-zA-Z]/g, '').substring(0, 20); // Limit length to 20 characters

    // Combine letters-only prefix with UUID
    return lettersOnly ? `${lettersOnly}${uuid}` : `file${uuid}`;
  } catch (error) {
    logger.warn('Error generating safe filename, using UUID', {
      originalName,
      error: error instanceof Error ? error.message : String(error),
    });
    return `file${uuid}`;
  }
}

/**
 * Sanitize folder path for Cloudinary
 * Only allows letters, numbers, and underscores in folder names
 */
function sanitizeFolderPath(folder: string): string {
  if (!folder) return 'uploads';

  // Process each folder segment individually
  const sanitizedParts = folder
    .trim()
    .replace(/^\/+|\/+$/g, '') // Remove leading/trailing slashes
    .split('/')
    .map((segment) => {
      // Only keep letters, numbers, and underscores for each folder segment
      return segment
        .replace(/[^a-zA-Z0-9_]/g, '_')
        .replace(/_+/g, '_') // Replace multiple underscores with a single one
        .replace(/^_|_$/g, ''); // Trim leading/trailing underscores
    })
    .filter((segment) => segment.length > 0); // Remove empty segments

  // Limit folder depth (max 3 levels deep)
  if (sanitizedParts.length > 3) {
    return sanitizedParts.slice(0, 3).join('/');
  }

  return sanitizedParts.join('/') || 'uploads';
}

/**
 * Writes buffer to a temporary file
 * @param buffer The buffer to write
 * @returns Path to the temporary file
 */
export async function writeBufferToTempFile(buffer: Buffer): Promise<string> {
  const tempDir = os.tmpdir();
  const tempFilePath = path.join(tempDir, `upload_${Date.now()}_${randomUUID()}`);

  return new Promise<string>((resolve, reject) => {
    fs.writeFile(tempFilePath, buffer, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(tempFilePath);
      }
    });
  });
}

/**
 * Remove temporary file
 * @param filePath Path to the temporary file
 */
export async function removeTempFile(filePath: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        logger.warn('Failed to remove temporary file', { filePath, error: err.message });
      }
      // Always resolve, even if deleting fails
      resolve();
    });
  });
}

/**
 * Upload a file to Cloudinary with support for large files
 * @param file The file buffer or file path to upload
 * @param folder The folder to upload to (optional)
 * @param fileName The original filename (optional)
 * @returns The Cloudinary secure URL
 */
export const uploadToCloudinary = async (
  file: Buffer | string,
  folder: string = 'general',
  fileName?: string,
): Promise<string> => {
  let tempFilePath: string | null = null;

  try {
    let uploadPath: string;

    if (Buffer.isBuffer(file)) {
      // If it's a buffer, write to temp file first
      tempFilePath = await writeBufferToTempFile(file);
      uploadPath = tempFilePath;
    } else {
      // If it's already a file path
      uploadPath = file;
    }

    const sanitizedFolder = sanitizeFolderPath(folder);
    const safeFileName = fileName ? generateSafeFileName(fileName) : undefined;

    const result = await cloudinary.uploader.upload(uploadPath, {
      folder: sanitizedFolder,
      public_id: safeFileName,
      resource_type: 'auto',
      transformation: [
        { width: 1200, height: 800, crop: 'limit' }, // Limit max dimensions
        { quality: 'auto', fetch_format: 'auto' }, // Optimize quality and format
      ],
    });

    logger.info('Cloudinary upload successful', {
      publicId: result.public_id,
      url: result.secure_url,
      folder: sanitizedFolder,
    });

    return result.secure_url;
  } catch (error) {
    logger.error('Cloudinary upload failed', {
      folder,
      fileName,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  } finally {
    // Clean up temp file if we created one
    if (tempFilePath) {
      await removeTempFile(tempFilePath);
    }
  }
};

/**
 * Delete a file from Cloudinary
 * @param publicId The public ID of the file to delete
 */
export const deleteFromCloudinary = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);

    logger.info('Cloudinary delete successful', {
      publicId,
      result: result.result,
    });

    return result;
  } catch (error) {
    logger.error('Cloudinary delete failed', {
      publicId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
};
