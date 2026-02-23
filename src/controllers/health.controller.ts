import { getSystemHealth } from '../services/health.service'
import { STATUS_CODES } from '../config/constants'

import type { Request, Response } from 'express'

export const checkHealth = (req: Request, res: Response) => {
  const healthData = getSystemHealth()

  return res.status(STATUS_CODES.OK).json(healthData)
}