import { Response } from 'express';

type StatusType = 'success' | 'error' | 'fail';

interface ApiResponse {
  status: StatusType;
  message: string;
  data?: any;
  errors?: string[];
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    [key: string]: any;
  };
}

/*** Send standardized API response ***/
export const sendResponse = (
  res: Response,
  statusCode: number,
  status: StatusType,
  message: string,
  data?: any,
  errors?: string[],
  meta?: ApiResponse['meta'],
): void => {
  const responseBody: ApiResponse = {
    status,
    message,
  };

  if (data !== undefined) responseBody.data = data;
  if (errors && errors.length > 0) responseBody.errors = errors;
  if (meta) responseBody.meta = meta;

  res.status(statusCode).json(responseBody);
};

/*** Send success response ***/
export const sendSuccess = (
  res: Response,
  statusCode = 200,
  message = 'Success',
  data?: any,
  meta?: ApiResponse['meta'],
): void => {
  sendResponse(res, statusCode, 'success', message, data, undefined, meta);
};

/*** Send error response (server error) ***/
export const sendError = (
  res: Response,
  statusCode = 500,
  message = 'Error',
  errors?: string[],
  meta?: ApiResponse['meta'],
): void => {
  sendResponse(res, statusCode, 'error', message, undefined, errors, meta);
};

/*** Send fail response (client error) ***/
export const sendFail = (
  res: Response,
  statusCode = 400,
  message = 'Failed',
  errors?: string[],
  meta?: ApiResponse['meta'],
): void => {
  sendResponse(res, statusCode, 'fail', message, undefined, errors, meta);
};
