import express from 'express';

import { SERVER_ERROR_STATUS, BAD_REQUEST_STATUS, HTTP_OK_STATUS, SERVER_PORT, CODE_LENGTH } from '../config/constants.js';
import { sendPromptToAI, enableAnonymousMode, getAIResponseText, resetPage } from '../scraper/prompt.js';
import { processVerificationCode } from '../scraper/auth.js';
import { HTML_UI } from '../ui/template.js';

import type { Request, Response } from 'express';
import type { Page } from 'puppeteer';

export const initializeVerificationServer = (page: Page): void => {
  const app = express();
  app.use(express.json());
  app.get('/', (_: Request, response: Response) => response.send(HTML_UI));
  app.post('/verify', async (request: Request, response: Response) => {
    const { code } = request.body;
    if (!code || code.length !== CODE_LENGTH) return response.status(BAD_REQUEST_STATUS).json({ error: 'InvalidCode' });
    const isVerified = await processVerificationCode(page, code);
    if (!isVerified) return response.status(SERVER_ERROR_STATUS).json({ error: 'VerificationFailed' });
    await enableAnonymousMode(page);
    return response.status(HTTP_OK_STATUS).json({ success: true });
  });
  app.post('/ask', async (request: Request, response: Response) => {
    const { prompt } = request.body;
    if (!prompt) return response.status(BAD_REQUEST_STATUS).json({ error: 'InvalidPrompt' });
    const isSent = await sendPromptToAI(page, prompt);
    if (!isSent) return response.status(SERVER_ERROR_STATUS).json({ error: 'PromptFailed' });
    const responseText = await getAIResponseText(page);
    if (!responseText) return response.status(SERVER_ERROR_STATUS).json({ error: 'ExtractionFailed' });
    await resetPage(page);
    return response.status(HTTP_OK_STATUS).json({ success: true, data: responseText });
  });
  app.listen(SERVER_PORT);
};