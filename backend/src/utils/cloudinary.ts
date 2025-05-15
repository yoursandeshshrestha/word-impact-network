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
async function writeBufferToTempFile(buffer: Buffer): Promise<string> {
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
async function removeTempFile(filePath: string): Promise<void> {
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
 * @param file The file buffer to upload
 * @param folder The folder to upload to (optional)
 * @param fileName The original filename (optional)
 * @returns The Cloudinary secure URL
 */
export const uploadToCloudinary = async (
  file: Buffer,
  folder?: string,
  fileName?: string,
): Promise<string> => {
  let tempFilePath: string | null = null;

  try {
    // Generate a completely sanitized folder and filename
    const safeFolder = folder ? sanitizeFolderPath(folder) : 'win_documents';
    const safeFileName = generateSafeFileName(fileName);

    logger.info('Starting file upload to Cloudinary', {
      fileSize: file.length,
      safeFolder,
      safeFileName,
    });

    // Check if this is a large file
    const isLargeFile = file.length > LARGE_FILE_THRESHOLD;

    let uploadResult: CloudinaryUploadResult;

    if (isLargeFile) {
      // For large files, write to temp file and use Cloudinary's upload_large API
      logger.info('Using large file upload method', { fileSize: file.length });

      tempFilePath = await writeBufferToTempFile(file);

      uploadResult = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_large(
          tempFilePath as string,
          {
            folder: safeFolder,
            public_id: safeFileName,
            resource_type: 'auto',
            chunk_size: 6000000,
          },
          (error, result) => {
            if (error || !result) {
              reject(new AppError('Failed to upload file', 500, ErrorTypes.SERVER));
            } else {
              resolve(result);
            }
          },
        );
      });
    } else {
      // For smaller files, use the standard base64 upload
      const base64File = `data:application/octet-stream;base64,${file.toString('base64')}`;

      uploadResult = await cloudinary.uploader.upload(base64File, {
        folder: safeFolder,
        public_id: safeFileName,
        resource_type: 'auto',
        chunk_size: 6000000,
      });
    }

    logger.info('File uploaded successfully to Cloudinary', {
      public_id: uploadResult.public_id,
      url: uploadResult.secure_url,
      resource_type: uploadResult.resource_type,
      fileSize: file.length,
    });

    if (!uploadResult) {
      throw new AppError('Failed to upload file', 500, ErrorTypes.SERVER);
    }

    return uploadResult.secure_url;
  } catch (error) {
    logger.error('Error uploading file to Cloudinary', {
      error: error instanceof Error ? error.message : String(error),
      details: error instanceof Error ? error.stack : JSON.stringify(error),
      fileSize: file.length,
      folder,
      fileName,
    });
    throw new AppError('Failed to upload file', 500, ErrorTypes.SERVER);
  } finally {
    // Clean up the temporary file if it was created
    if (tempFilePath) {
      await removeTempFile(tempFilePath).catch((err) => {
        logger.warn('Error removing temp file', { tempFilePath, error: err.message });
      });
    }
  }
};

/**
 * Delete a file from Cloudinary
 * @param publicId The public ID of the file to delete
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    logger.info('Deleting file from Cloudinary', { publicId });

    await cloudinary.uploader.destroy(publicId);

    logger.info('File deleted successfully from Cloudinary', { publicId });
  } catch (error) {
    logger.error('Error deleting file from Cloudinary', {
      publicId,
      error: error instanceof Error ? error.message : String(error),
    });
    // We don't throw an error here to prevent blocking other operations
  }
};
