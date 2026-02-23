import { Router } from 'express'

import { checkHealth } from '../controllers/health.controller'

export const healthRouter = Router()

healthRouter.get('/', checkHealth)