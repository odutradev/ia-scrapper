import express from 'express';

import { SERVER_ERROR_STATUS, BAD_REQUEST_STATUS, HTTP_OK_STATUS, SERVER_PORT, CODE_LENGTH } from '../config/constants.js';
import { processVerificationCode } from '../scraper/auth.js';
import { HTML_UI } from '../ui/template.js';

export const initializeVerificationServer = (page) => {
  const app = express();
  app.use(express.json());
  app.get('/', (_, response) => response.send(HTML_UI));
  app.post('/verify', async (request, response) => {
    const { code } = request.body;
    if (!code || code.length !== CODE_LENGTH) return response.status(BAD_REQUEST_STATUS).json({ error: 'InvalidCode' });
    const isVerified = await processVerificationCode(page, code);
    if (!isVerified) return response.status(SERVER_ERROR_STATUS).json({ error: 'VerificationFailed' });
    return response.status(HTTP_OK_STATUS).json({ success: true });
  });
  app.listen(SERVER_PORT);
};