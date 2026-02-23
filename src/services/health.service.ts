import type { HealthResponse } from '../types'

export const getSystemHealth = (): HealthResponse => ({
  status: 'healthy',
  timestamp: new Date().toISOString(),
  uptime: process.uptime()
})