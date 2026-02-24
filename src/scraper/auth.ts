import { VERIFY_URL_INDICATOR, SUBMIT_BUTTON_XPATH, VERIFY_BUTTON_XPATH, CODE_INPUT_SELECTOR, EMAIL_INPUT_XPATH, TYPING_DELAY, USER_EMAIL } from '../config/constants.js';

import type { Page } from 'puppeteer';

export const executeLoginFlow = async (page: Page): Promise<boolean> => {
  try {
    const emailInput = await page.waitForSelector(EMAIL_INPUT_XPATH, { visible: true });
    if (!emailInput) return false;
    await emailInput.type(USER_EMAIL, { delay: TYPING_DELAY });
    const submitButton = await page.waitForSelector(SUBMIT_BUTTON_XPATH, { visible: true });
    if (!submitButton) return false;
    await submitButton.click();
    return true;
  } catch {
    return false;
  }
};

export const processVerificationCode = async (page: Page, code: string): Promise<boolean> => {
  try {
    if (!page.url().includes(VERIFY_URL_INDICATOR)) return false;
    const firstCodeInput = await page.waitForSelector(CODE_INPUT_SELECTOR, { visible: true });
    if (!firstCodeInput) return false;
    await firstCodeInput.focus();
    await page.keyboard.type(code, { delay: TYPING_DELAY });
    const verifyButton = await page.waitForSelector(VERIFY_BUTTON_XPATH, { visible: true });
    if (!verifyButton) return false;
    await verifyButton.click();
    return true;
  } catch {
    return false;
  }
};