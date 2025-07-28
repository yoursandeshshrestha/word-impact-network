import { logger } from './logger';
import { AppError, ErrorTypes } from './appError';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import { createReadStream } from 'fs';
import axios from 'axios';

// Validate required environment variables
const requiredEnvVars = ['VIMEO_CLIENT_ID', 'VIMEO_CLIENT_SECRET', 'VIMEO_REDIRECT_URI'];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new AppError(
    `Missing required Vimeo environment variables: ${missingEnvVars.join(', ')}`,
    500,
    ErrorTypes.SERVER,
  );
}

// Vimeo configuration
const VIMEO_CONFIG = {
  clientId: process.env.VIMEO_CLIENT_ID!,
  clientSecret: process.env.VIMEO_CLIENT_SECRET!,
  redirectUri: process.env.VIMEO_REDIRECT_URI!,
  apiBaseUrl: 'https://api.vimeo.com',
};

// In-memory token storage (in production, use Redis or database)
let vimeoAccessToken: string | null = process.env.VIMEO_ACCESS_TOKEN || null;
let tokenExpiryTime: number | null = null;

// Token management functions
export const setVimeoAccessToken = (token: string, expiresIn?: number) => {
  vimeoAccessToken = token;
  if (expiresIn) {
    tokenExpiryTime = Date.now() + expiresIn * 1000;
  }
  logger.info('Vimeo access token updated', {
    hasToken: !!token,
    expiresIn: expiresIn ? `${expiresIn}s` : 'unknown',
  });
};

export const getVimeoAccessToken = (): string | null => {
  // Check if token is expired
  if (tokenExpiryTime && Date.now() > tokenExpiryTime) {
    logger.warn('Vimeo access token has expired');
    vimeoAccessToken = null;
    tokenExpiryTime = null;
    return null;
  }

  return vimeoAccessToken;
};

export const hasValidVimeoToken = (): boolean => {
  const token = getVimeoAccessToken();
  return !!token;
};

export const validateVimeoToken = async (): Promise<boolean> => {
  try {
    const token = getVimeoAccessToken();
    if (!token) {
      return false;
    }

    // Test the token by making a simple API call
    const response = await axios.get(`${VIMEO_CONFIG.apiBaseUrl}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 5000,
    });

    return response.status === 200;
  } catch (error) {
    logger.error('Vimeo token validation failed', {
      error: error instanceof Error ? error.message : String(error),
    });

    // If token is invalid, clear it
    if (
      axios.isAxiosError(error) &&
      (error.response?.status === 401 || error.response?.status === 403)
    ) {
      vimeoAccessToken = null;
      tokenExpiryTime = null;
    }

    return false;
  }
};

interface VimeoUploadResult {
  success: boolean;
  videoId: string;
  videoUrl: string;
  embedUrl: string;
  fileName: string;
}

interface VimeoVideoInfo {
  id: string;
  name: string;
  description: string;
  duration: number;
  embed: {
    html: string;
  };
  link: string;
  player_embed_url: string;
  status: {
    upload: {
      status: string;
    };
    transcode: {
      status: string;
    };
  };
  play: {
    status: string;
  };
  privacy?: {
    view?: 'anybody' | 'nobody' | 'contacts' | 'password' | 'disable';
  };
}

/**
 * Generate OAuth authorization URL for Vimeo
 */
export const getVimeoAuthUrl = (): string => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: VIMEO_CONFIG.clientId,
    redirect_uri: VIMEO_CONFIG.redirectUri,
    scope: 'private upload video_files',
  });

  return `${VIMEO_CONFIG.apiBaseUrl}/oauth/authorize?${params.toString()}`;
};

/**
 * Exchange authorization code for access token
 */
export const exchangeCodeForToken = async (code: string): Promise<string> => {
  try {
    const response = await axios.post(`${VIMEO_CONFIG.apiBaseUrl}/oauth/access_token`, null, {
      auth: {
        username: VIMEO_CONFIG.clientId,
        password: VIMEO_CONFIG.clientSecret,
      },
      params: {
        grant_type: 'authorization_code',
        code,
        redirect_uri: VIMEO_CONFIG.redirectUri,
      },
    });

    const accessToken = response.data.access_token;
    const expiresIn = response.data.expires_in; // Vimeo tokens typically expire in 1 hour

    // Store the token with expiry
    setVimeoAccessToken(accessToken, expiresIn);

    logger.info('Successfully exchanged code for Vimeo access token', {
      hasToken: !!accessToken,
      expiresIn: expiresIn ? `${expiresIn}s` : 'unknown',
    });

    return accessToken;
  } catch (error) {
    logger.error('Error exchanging code for token', {
      error: error instanceof Error ? error.message : String(error),
      response: axios.isAxiosError(error) ? error.response?.data : null,
    });
    throw new AppError('Failed to authenticate with Vimeo', 500, ErrorTypes.SERVER);
  }
};

/**
 * Upload video to Vimeo using TUS protocol
 */
export const uploadToVimeo = async (
  filePath: string,
  title: string,
  description?: string,
): Promise<VimeoUploadResult> => {
  try {
    // Check if we have a valid access token
    if (!hasValidVimeoToken()) {
      throw new AppError(
        'Vimeo access token not available. Please complete OAuth authentication first.',
        401,
        ErrorTypes.AUTHORIZATION,
      );
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new AppError(`File not found: ${filePath}`, 400, ErrorTypes.VALIDATION);
    }

    const fileSize = fs.statSync(filePath).size;
    const fileName = `${title}-${randomUUID()}.mp4`;

    logger.info('Starting Vimeo upload', {
      filePath,
      fileName,
      fileSize,
      title,
      fileExists: fs.existsSync(filePath),
    });

    // Step 1: Create upload
    const createUploadResponse = await axios.post(
      `${VIMEO_CONFIG.apiBaseUrl}/me/videos`,
      {
        upload: {
          approach: 'tus',
          size: fileSize,
        },
        name: title,
        description: description || '',
        privacy: {
          view: 'nobody',
          embed: 'whitelist',
          domains: [
            'wordimpactnetwork.org',
            'www.wordimpactnetwork.org',
            'admin.wordimpactnetwork.org',
            'https://wordimpactnetwork.org',
            'https://www.wordimpactnetwork.org',
            'https://admin.wordimpactnetwork.org',
            'http://wordimpactnetwork.org',
            'http://www.wordimpactnetwork.org',
            'http://admin.wordimpactnetwork.org',
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${vimeoAccessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const uploadLink = createUploadResponse.data.upload.upload_link;
    const videoId = createUploadResponse.data.uri.split('/').pop();

    logger.info('Vimeo upload created', {
      videoId,
      uploadLink,
    });

    // Step 2: Upload file using TUS
    logger.info('Starting TUS upload', { uploadLink, fileSize });

    const fileStream = createReadStream(filePath);

    try {
      const uploadResponse = await axios.patch(uploadLink, fileStream, {
        headers: {
          'Tus-Resumable': '1.0.0',
          'Upload-Offset': '0',
          'Content-Type': 'application/offset+octet-stream',
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 300000, // 5 minutes timeout
      });

      logger.info('TUS upload response', {
        status: uploadResponse.status,
        statusText: uploadResponse.statusText,
        headers: uploadResponse.headers,
      });

      if (uploadResponse.status !== 204) {
        throw new Error(
          `TUS upload failed with status ${uploadResponse.status}: ${uploadResponse.statusText}`,
        );
      }
    } catch (uploadError) {
      logger.error('TUS upload failed', {
        error: uploadError instanceof Error ? uploadError.message : String(uploadError),
        uploadLink,
        fileSize,
      });
      throw uploadError;
    }

    // Step 3: Get video info
    const videoInfoResponse = await axios.get(`${VIMEO_CONFIG.apiBaseUrl}/videos/${videoId}`, {
      headers: {
        Authorization: `Bearer ${vimeoAccessToken}`,
      },
    });

    const videoInfo: VimeoVideoInfo = videoInfoResponse.data;

    logger.info('Vimeo upload completed successfully', {
      videoId,
      videoUrl: videoInfo.link,
      embedUrl: videoInfo.player_embed_url,
    });

    return {
      success: true,
      videoId,
      videoUrl: videoInfo.link,
      embedUrl: videoInfo.player_embed_url,
      fileName,
    };
  } catch (error) {
    logger.error('Error uploading to Vimeo', {
      error: error instanceof Error ? error.message : String(error),
      errorDetails: error,
      filePath,
      title,
      hasToken: !!vimeoAccessToken,
      tokenLength: vimeoAccessToken?.length || 0,
    });

    // Log the full error for debugging
    if (error instanceof Error) {
      console.error('Full Vimeo upload error:', error);
    }

    throw new AppError('Failed to upload video to Vimeo', 500, ErrorTypes.SERVER);
  }
};

/**
 * Delete video from Vimeo
 */
export const deleteFromVimeo = async (videoId: string): Promise<void> => {
  try {
    // Check if we have a valid access token
    if (!hasValidVimeoToken()) {
      throw new AppError(
        'Vimeo access token not available. Please complete OAuth authentication first.',
        401,
        ErrorTypes.AUTHORIZATION,
      );
    }

    logger.info('Deleting video from Vimeo', { videoId });

    const response = await axios.delete(`${VIMEO_CONFIG.apiBaseUrl}/videos/${videoId}`, {
      headers: {
        Authorization: `Bearer ${vimeoAccessToken}`,
      },
    });

    if (response.status === 204) {
      logger.info('Video deleted from Vimeo successfully', { videoId });
    } else {
      throw new Error(`Failed to delete video: ${response.status}`);
    }
  } catch (error) {
    logger.error('Error deleting video from Vimeo', {
      error: error instanceof Error ? error.message : String(error),
      videoId,
    });
    throw new AppError('Failed to delete video from Vimeo', 500, ErrorTypes.SERVER);
  }
};

/**
 * Get video information from Vimeo
 */
export const getVimeoVideoInfo = async (videoId: string): Promise<VimeoVideoInfo> => {
  try {
    const response = await axios.get(`${VIMEO_CONFIG.apiBaseUrl}/videos/${videoId}`, {
      headers: {
        Authorization: `Bearer ${vimeoAccessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    logger.error('Error getting video info from Vimeo', {
      videoId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new AppError('Failed to get video information from Vimeo', 500, ErrorTypes.SERVER);
  }
};

/**
 * Check if a video is ready to play
 */
export const isVideoReadyToPlay = async (
  videoId: string,
): Promise<{ ready: boolean; status: string; message?: string }> => {
  try {
    const videoInfo = await getVimeoVideoInfo(videoId);

    // Check upload status
    if (videoInfo.status?.upload?.status !== 'complete') {
      return {
        ready: false,
        status: 'uploading',
        message: 'Video is still being uploaded',
      };
    }

    // Check transcode status
    if (videoInfo.status?.transcode?.status !== 'complete') {
      return {
        ready: false,
        status: 'processing',
        message: 'Video is being processed',
      };
    }

    // Check play status
    if (videoInfo.play?.status !== 'available') {
      return {
        ready: false,
        status: 'unavailable',
        message: 'Video is not available for playback',
      };
    }

    // Check privacy settings
    if (videoInfo.privacy?.view === 'nobody' || videoInfo.privacy?.view === 'password') {
      return {
        ready: false,
        status: 'private',
        message: 'Video is set to private. Please check privacy settings.',
      };
    }

    return {
      ready: true,
      status: 'ready',
      message: 'Video is ready to play',
    };
  } catch (error) {
    logger.error('Error checking video readiness', {
      videoId,
      error: error instanceof Error ? error.message : String(error),
    });

    // Check if it's an authentication error
    if (error instanceof Error && error.message.includes('401')) {
      return {
        ready: false,
        status: 'auth_error',
        message: 'Authentication required to access this video',
      };
    }

    // Check if it's a not found error
    if (error instanceof Error && error.message.includes('404')) {
      return {
        ready: false,
        status: 'not_found',
        message: 'Video not found or has been deleted',
      };
    }

    return {
      ready: false,
      status: 'error',
      message: 'Unable to check video status',
    };
  }
};

/**
 * Extract video ID from Vimeo URL
 */
export const extractVimeoVideoId = (url: string): string | null => {
  const patterns = [
    /vimeo\.com\/(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/,
    /vimeo\.com\/groups\/[^\/]+\/videos\/(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
};

/**
 * Generate embed URL for Vimeo video
 */
export const generateVimeoEmbedUrl = (videoId: string): string => {
  return `https://player.vimeo.com/video/${videoId}`;
};

/**
 * Refresh Vimeo access token using refresh token
 */
export const refreshVimeoToken = async (refreshToken: string): Promise<string> => {
  try {
    const response = await axios.post(`${VIMEO_CONFIG.apiBaseUrl}/oauth/access_token`, null, {
      auth: {
        username: VIMEO_CONFIG.clientId,
        password: VIMEO_CONFIG.clientSecret,
      },
      params: {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      },
    });

    const accessToken = response.data.access_token;
    const expiresIn = response.data.expires_in;
    const newRefreshToken = response.data.refresh_token;

    // Store the new token with expiry
    setVimeoAccessToken(accessToken, expiresIn);

    logger.info('Successfully refreshed Vimeo access token', {
      hasToken: !!accessToken,
      expiresIn: expiresIn ? `${expiresIn}s` : 'unknown',
      hasRefreshToken: !!newRefreshToken,
    });

    return accessToken;
  } catch (error) {
    logger.error('Error refreshing Vimeo token', {
      error: error instanceof Error ? error.message : String(error),
      response: axios.isAxiosError(error) ? error.response?.data : null,
    });
    throw new AppError('Failed to refresh Vimeo token', 500, ErrorTypes.SERVER);
  }
};

/**
 * Get a valid Vimeo access token, refreshing if necessary
 */
export const getValidVimeoToken = async (): Promise<string | null> => {
  const token = getVimeoAccessToken();

  if (token) {
    // Validate the current token
    const isValid = await validateVimeoToken();
    if (isValid) {
      return token;
    }
  }

  // If we have a refresh token, try to refresh
  const refreshToken = process.env.VIMEO_REFRESH_TOKEN;
  if (refreshToken) {
    try {
      logger.info('Attempting to refresh Vimeo token');
      const newToken = await refreshVimeoToken(refreshToken);
      return newToken;
    } catch (error) {
      logger.error('Failed to refresh Vimeo token', { error });
    }
  }

  return null;
};




