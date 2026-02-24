import puppeteer from 'puppeteer';
import 'dotenv/config';

import { VIEWPORT_HEIGHT, VIEWPORT_WIDTH, NETWORK_IDLE_EVENT, PERPLEXITY_URL, CLIPBOARD_WRITE, CLIPBOARD_READ } from './src/config/constants';
import { initializeVerificationServer } from './src/server/index';
import { executeLoginFlow } from './src/scraper/auth';

const initializeScraper = async (): Promise<void> => {
  try {
    const browser = await puppeteer.launch({ headless: false, defaultViewport: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT } });
    const context = browser.defaultBrowserContext();
    await context.overridePermissions(PERPLEXITY_URL, [CLIPBOARD_READ, CLIPBOARD_WRITE]);
    const page = await browser.newPage();
    await page.goto(PERPLEXITY_URL, { waitUntil: NETWORK_IDLE_EVENT });
    const isLoginStarted = await executeLoginFlow(page);
    if (!isLoginStarted) return await browser.close();
    initializeVerificationServer(page);
  } catch {
    process.exit(1);
  }
};

initializeScraper();