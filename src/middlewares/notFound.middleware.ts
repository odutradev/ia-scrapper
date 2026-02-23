import { STATUS_CODES } from '../config/constants'

import type { Request, Response } from 'express'

export const notFoundHandler = (req: Request, res: Response) => {
  return res.status(STATUS_CODES.NOT_FOUND).json({ error: 'Route not found' })
}