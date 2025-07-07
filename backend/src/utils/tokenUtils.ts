import { Request } from 'express';
import { verifyAccessToken, verifyRefreshToken } from './jwt';

/**
 * Token selection strategy to avoid conflicts between admin and frontend tokens
 */
export interface TokenSelection {
  accessToken?: string;
  refreshToken?: string;
  tokenType: 'admin' | 'frontend' | 'none';
}

/**
 * Get admin tokens from cookies
 * @param req Express request object
 * @returns TokenSelection object with admin tokens
 */
export const getAdminTokens = (req: Request): TokenSelection => {
  const adminAccessToken = req.cookies['accessToken'];
  const adminRefreshToken = req.cookies['refreshToken'];

  return {
    accessToken: adminAccessToken,
    refreshToken: adminRefreshToken,
    tokenType: adminAccessToken ? 'admin' : 'none',
  };
};

/**
 * Get frontend/student tokens from cookies
 * @param req Express request object
 * @returns TokenSelection object with frontend tokens
 */
export const getFrontendTokens = (req: Request): TokenSelection => {
  const frontendAccessToken = req.cookies['client-access-token-win'];
  const frontendRefreshToken = req.cookies['client-refresh-token-win'];

  return {
    accessToken: frontendAccessToken,
    refreshToken: frontendRefreshToken,
    tokenType: frontendAccessToken ? 'frontend' : 'none',
  };
};

/**
 * Get the appropriate cookie names for a given token type
 * @param tokenType The type of token ('admin' or 'frontend')
 * @returns Object with access and refresh token cookie names
 */
export const getCookieNames = (tokenType: 'admin' | 'frontend') => {
  if (tokenType === 'admin') {
    return {
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
    };
  } else {
    return {
      accessToken: 'client-access-token-win',
      refreshToken: 'client-refresh-token-win',
    };
  }
};

/**
 * Clear all authentication cookies
 * @param res Express response object
 */
export const clearAllAuthCookies = (res: any) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.clearCookie('client-access-token-win', { path: '/' });
  res.clearCookie('client-refresh-token-win', { path: '/' });
};

/**
 * Clear only admin authentication cookies
 * @param res Express response object
 */
export const clearAdminAuthCookies = (res: any) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
};

/**
 * Clear only frontend/student authentication cookies
 * @param res Express response object
 */
export const clearFrontendAuthCookies = (res: any) => {
  res.clearCookie('client-access-token-win', { path: '/' });
  res.clearCookie('client-refresh-token-win', { path: '/' });
};
