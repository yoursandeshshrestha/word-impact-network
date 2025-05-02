import { v2 as cloudinary } from 'cloudinary';
import { logger } from './logger';
import { AppError, ErrorTypes } from './appError';

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

/**
 * Upload a file to Cloudinary
 * @param file The file buffer to upload
 * @param folder The folder to upload to
 * @param fileName The filename to use for the uploaded file
 * @returns The Cloudinary upload response
 */
export const uploadToCloudinary = async (
  file: Buffer,
  folder: string = 'win/documents',
  fileName?: string,
): Promise<string> => {
  try {
    logger.info('Uploading file to Cloudinary', { folder, fileName });

    // Convert buffer to base64
    const base64File = `data:application/octet-stream;base64,${file.toString('base64')}`;

    const result = await cloudinary.uploader.upload(base64File, {
      folder,
      resource_type: 'auto',
      access_mode: 'public',
      overwrite: true,
      public_id: fileName ? `${folder}/${fileName}` : undefined,
      type: 'upload',
      chunk_size: 6000000,
      eager: [
        { width: 300, height: 300, crop: 'pad', audio_codec: 'none' },
        { width: 160, height: 100, crop: 'crop', gravity: 'south', audio_codec: 'none' },
      ],
      eager_async: true,
      eager_notification_url: process.env.CLOUDINARY_NOTIFICATION_URL,
    });

    logger.info('File uploaded successfully to Cloudinary', {
      public_id: result.public_id,
      url: result.secure_url,
    });

    return result.secure_url;
  } catch (error) {
    logger.error('Error uploading file to Cloudinary', {
      error: error instanceof Error ? error.message : String(error),
      details: error instanceof Error ? error.stack : JSON.stringify(error),
      folder,
      fileName,
    });
    throw new AppError(
      error instanceof Error ? error.message : 'Failed to upload file',
      500,
      ErrorTypes.SERVER,
    );
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
