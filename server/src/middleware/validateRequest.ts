import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  const errors = result.array().map((item) => ({
    field: 'path' in item ? item.path : 'unknown',
    message: item.msg,
  }));

  return res.status(400).json({
    success: false,
    message: errors[0]?.message || 'Validation failed',
    errors,
  });
};
