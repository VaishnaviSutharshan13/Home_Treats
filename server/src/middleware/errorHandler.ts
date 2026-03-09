import { Request, Response, NextFunction } from 'express';

// Global error handler
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.name, '-', err.message);

  let statusCode = err.statusCode || 500;
  let message = 'Internal Server Error';
  let error: any = process.env.NODE_ENV === 'development' ? err.message : {};

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    error = Object.values(err.errors).map((e: any) => e.message);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate Entry';
    error = 'A record with this value already exists';
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID Format';
    error = 'The provided ID is not valid';
  }

  res.status(statusCode).json({ success: false, message, error });
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    error: `Cannot ${req.method} ${req.originalUrl}`,
  });
};
