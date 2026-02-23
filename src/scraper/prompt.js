import { ANONYMOUS_MODE_BUTTON_SELECTOR, ASK_INPUT_SELECTOR, TYPING_DELAY, ENTER_KEY } from '../config/constants.js';

export const enableAnonymousMode = async (page) => {
  try {
    const button = await page.waitForSelector(ANONYMOUS_MODE_BUTTON_SELECTOR, { visible: true });
    if (!button) return false;
    await button.click();
    return true;
  } catch {
    return false;
  }
};

export const sendPromptToAI = async (page, prompt) => {
  try {
    const input = await page.waitForSelector(ASK_INPUT_SELECTOR, { visible: true });
    if (!input) return false;
    await input.focus();
    await page.keyboard.type(prompt, { delay: TYPING_DELAY });
    await page.keyboard.press(ENTER_KEY);
    return true;
  } catch {
    return false;
  }
};