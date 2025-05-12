/**
 * Validates that a file is of the correct type and size
 * @param file File to validate
 * @param allowedTypes Array of allowed mime types
 * @param maxSizeInMB Maximum file size in MB
 * @returns Object with validation result and error message
 */
export const validateFile = (
  file: File,
  allowedTypes: string[] = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
  ],
  maxSizeInMB: number = 2
): { isValid: boolean; errorMessage: string } => {
  // Validate file type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      errorMessage: `Invalid file type. Allowed types: ${allowedTypes.join(
        ", "
      )}`,
    };
  }

  // Validate file size
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return {
      isValid: false,
      errorMessage: `File size exceeds ${maxSizeInMB}MB. Please upload a smaller file.`,
    };
  }

  return { isValid: true, errorMessage: "" };
};

/**
 * Creates a URL for an image file to preview it
 * @param file File to preview
 * @returns Promise that resolves to the preview URL
 */
export const createFilePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to create preview"));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Formats a file size in bytes to a human-readable format
 * @param bytes File size in bytes
 * @param decimals Number of decimal places (default: 2)
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};
