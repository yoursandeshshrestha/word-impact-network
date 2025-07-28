import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendSuccess, sendError } from '../utils/responseHandler';
import {
  getVimeoAuthUrl,
  exchangeCodeForToken,
  setVimeoAccessToken,
  getVimeoAccessToken,
  isVideoReadyToPlay,
  validateVimeoToken,
  getValidVimeoToken,
} from '../utils/vimeo';
import { logger } from '../utils/logger';
import axios from 'axios';

/**
 * Get Vimeo authorization URL
 * @route GET /api/v1/vimeo/auth
 * @access Private (Admin only)
 */
export const getVimeoAuth = catchAsync(async (req: Request, res: Response) => {
  const authUrl = getVimeoAuthUrl();
  sendSuccess(res, 200, 'Vimeo authorization URL generated', { authUrl });
});

/**
 * Handle Vimeo OAuth callback
 * @route GET /api/v1/vimeo/callback
 * @access Public
 */
export const handleVimeoCallback = catchAsync(async (req: Request, res: Response) => {
  const { code, error } = req.query;

  if (error) {
    logger.error('Vimeo OAuth error', { error });
    return sendError(res, 400, 'Vimeo authorization failed', [error as string]);
  }

  if (!code) {
    return sendError(res, 400, 'Authorization code is required', [
      'Authorization code is required',
    ]);
  }

  // Exchange code for access token
  const accessToken = await exchangeCodeForToken(code as string);

  logger.info('Vimeo OAuth successful', { code: code as string });

  // Store the token (it's already stored in the exchangeCodeForToken function)
  sendSuccess(res, 200, 'Vimeo authorization successful', {
    message: 'Access token has been stored and is ready for use',
    // Note: In production, don't return the access token directly
    // Store it securely and use it for API calls
  });
});

/**
 * Test Vimeo connection
 * @route GET /api/v1/vimeo/test
 * @access Private (Admin only)
 */
export const testVimeoConnection = catchAsync(async (req: Request, res: Response) => {
  const { hasValidVimeoToken, getVimeoAccessToken } = await import('../utils/vimeo');

  if (!hasValidVimeoToken()) {
    return sendError(res, 401, 'No Vimeo access token available', [
      'Please complete OAuth authentication first',
    ]);
  }

  try {
    // Test the token by making a simple API call
    const response = await axios.get('https://api.vimeo.com/me', {
      headers: {
        Authorization: `Bearer ${getVimeoAccessToken()}`,
      },
    });

    sendSuccess(res, 200, 'Vimeo connection successful', {
      user: response.data.name,
      account: response.data.account,
      tokenValid: true,
    });
  } catch (error) {
    logger.error('Vimeo connection test failed', {
      error: error instanceof Error ? error.message : String(error),
    });

    sendError(res, 401, 'Vimeo connection failed', ['Access token may be invalid or expired']);
  }
});

export const createVimeoUploadSession = catchAsync(async (req: Request, res: Response) => {
  try {
    const { title, description, size } = req.body;

    // Get a valid Vimeo token (will refresh if necessary)
    const accessToken = await getValidVimeoToken();
    if (!accessToken) {
      logger.error('No valid Vimeo token available in createVimeoUploadSession');
      return sendError(res, 401, 'Vimeo authentication required. Please complete OAuth setup.');
    }

    // Step 1: Create upload session on Vimeo
    const response = await axios.post(
      'https://api.vimeo.com/me/videos',
      {
        upload: {
          approach: 'tus',
          size,
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
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const uploadLink = response.data.upload.upload_link;
    const videoId = response.data.uri.split('/').pop();

    sendSuccess(res, 200, 'Vimeo upload session created successfully', { uploadLink, videoId });
  } catch (error) {
    logger.error('Error creating Vimeo upload session', {
      error: error instanceof Error ? error.message : String(error),
      response: axios.isAxiosError(error) ? error.response?.data : null,
    });

    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data;
      if (errorData?.error_code === 8003) {
        return sendError(res, 401, 'Vimeo authentication failed. Please complete OAuth setup.');
      } else if (errorData?.error_code) {
        return sendError(
          res,
          error.response?.status || 500,
          `Vimeo error: ${errorData.error || 'Unknown error'}`,
        );
      }
    }

    sendError(res, 500, 'Failed to create upload session');
  }
});




