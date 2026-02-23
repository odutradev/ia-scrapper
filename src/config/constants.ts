export const ENV = process.env.NODE_ENV ?? 'development'

export const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000

export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500
} as const