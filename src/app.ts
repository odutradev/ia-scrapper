import express from 'express'
import helmet from 'helmet'
import cors from 'cors'

import { notFoundHandler } from './middlewares/notFound.middleware'
import { errorHandler } from './middlewares/error.middleware'
import { apiRouter } from './routes'

export const buildApp = () => {
  const app = express()

  app.use(helmet())
  app.use(cors())
  app.use(express.json())

  app.use('/api', apiRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}