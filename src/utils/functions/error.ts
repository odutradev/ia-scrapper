import { ResponseErrors } from '@assets/config/errors';
import defaultConfig from '@assets/config/default';
import logger from './logger';

import type { ResponseErrorsParams } from '@assets/config/errors';
import type { Response } from 'express';

export interface SendErrorParams {
  code: ResponseErrorsParams;
  res: Response;
  local?: string;
  options?: Record<string, unknown>;
  error?: unknown;
}

const sendError = ({ code, res, error, local }: SendErrorParams): string => {
  try {
    const localMessage = local ? `[${local}] ` : '';
    const responseError = ResponseErrors[code];
    if (defaultConfig.logError.message) logger.error(localMessage + responseError.message);
    if (error && defaultConfig.logError.data) console.log(error);
    res.status(responseError.statusCode).json(responseError);
    return 'error';
  } catch (catchError) {
    logger.error('[sendError] Server error');
    console.log(catchError);
    const serverErrorResponse = ResponseErrors['internal_error'];
    res.status(500).json(serverErrorResponse);
    return 'error';
  }
};

export default sendError;