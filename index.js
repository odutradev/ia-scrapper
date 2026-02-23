import puppeteer from 'puppeteer';

import { VIEWPORT_HEIGHT, VIEWPORT_WIDTH, NETWORK_IDLE_EVENT, PERPLEXITY_URL } from './src/config/constants.js';
import { initializeVerificationServer } from './src/server/index.js';
import { executeLoginFlow } from './src/scraper/auth.js';

const initializeScraper = async () => {
  try {
    const browser = await puppeteer.launch({ headless: false, defaultViewport: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT } });
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