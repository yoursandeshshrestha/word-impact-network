import { v2 as cloudinary } from 'cloudinary';
import { logger } from './logger';
import { AppError, ErrorTypes } from './appError';

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
 * @returns The Cloudinary upload response
 */
export const uploadToCloudinary = async (
  file: Buffer,
  folder: string = 'win/documents',
): Promise<string> => {
  try {
    logger.info('Uploading file to Cloudinary', { folder });

    // Convert buffer to base64
    const base64File = `data:application/octet-stream;base64,${file.toString('base64')}`;

    const result = await cloudinary.uploader.upload(base64File, {
      folder,
      resource_type: 'auto',
    });

    logger.info('File uploaded successfully to Cloudinary', {
      public_id: result.public_id,
      url: result.secure_url,
    });

    return result.secure_url;
  } catch (error) {
    logger.error('Error uploading file to Cloudinary', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new AppError('Failed to upload file', 500, ErrorTypes.SERVER);
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
