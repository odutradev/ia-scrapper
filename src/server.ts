import { PORT } from './config/constants'
import { buildApp } from './app'

const startServer = () => {
  const app = buildApp()

  app.listen(PORT, () => {
    process.stdout.write(`Server running on port ${PORT}\n`)
  })
}

startServer()