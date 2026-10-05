import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: unknown;
  timestamp: string;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Operation successful',
  statusCode = 200
): Response {
  const payload: ApiResponse<T> = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
  return res.status(statusCode).json(payload);
}

export function sendError(
  res: Response,
  message = 'An unexpected error occurred',
  statusCode = 500,
  error?: unknown
): Response {
  const payload: ApiResponse = {
    success: false,
    message,
    ...(error !== undefined && { error }),
    timestamp: new Date().toISOString()
  };
  return res.status(statusCode).json(payload);
}
