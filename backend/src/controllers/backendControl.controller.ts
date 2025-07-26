import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/responseHandler';
import { getBackendStatus, setBackendStatus, toggleBackendStatus } from '../utils/backendControl';

export const getBackendControlStatus = async (req: Request, res: Response) => {
  try {
    const status = getBackendStatus();
    sendSuccess(res, 200, 'Backend status retrieved successfully', {
      isEnabled: status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    sendError(res, 500, 'Failed to get backend status', [
      error instanceof Error ? error.message : 'Unknown error',
    ]);
  }
};

export const enableBackend = async (req: Request, res: Response) => {
  try {
    setBackendStatus(true);
    sendSuccess(res, 200, 'Backend enabled successfully', {
      isEnabled: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    sendError(res, 500, 'Failed to enable backend', [
      error instanceof Error ? error.message : 'Unknown error',
    ]);
  }
};

export const disableBackend = async (req: Request, res: Response) => {
  try {
    setBackendStatus(false);
    sendSuccess(res, 200, 'Backend disabled successfully', {
      isEnabled: false,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    sendError(res, 500, 'Failed to disable backend', [
      error instanceof Error ? error.message : 'Unknown error',
    ]);
  }
};

export const toggleBackend = async (req: Request, res: Response) => {
  try {
    const newStatus = toggleBackendStatus();
    sendSuccess(res, 200, 'Backend status toggled successfully', {
      isEnabled: newStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    sendError(res, 500, 'Failed to toggle backend status', [
      error instanceof Error ? error.message : 'Unknown error',
    ]);
  }
};
