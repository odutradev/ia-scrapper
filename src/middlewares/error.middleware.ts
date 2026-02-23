import { STATUS_CODES } from '../config/constants'

import type { Request, Response, NextFunction } from 'express'

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const status = STATUS_CODES.INTERNAL_ERROR
  const message = err.message ?? 'Internal Server Error'

  return res.status(status).json({ error: message })
}