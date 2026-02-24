import { ANONYMOUS_MODE_BUTTON_SELECTOR, RESPONSES_CONTAINER_XPATH, STOP_BUTTON_SELECTOR, COPY_BUTTON_SELECTOR, GENERATION_TIMEOUT, ASK_INPUT_SELECTOR, CLIPBOARD_DELAY, BUTTON_WAIT, TYPING_DELAY, ENTER_KEY, DIV_TAG } from '../config/constants.js';

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

export const getAIResponseText = async (page) => {
  try {
    await page.waitForSelector(STOP_BUTTON_SELECTOR, { visible: true, timeout: BUTTON_WAIT }).catch(() => {});
    await page.waitForSelector(STOP_BUTTON_SELECTOR, { hidden: true, timeout: GENERATION_TIMEOUT });
    return await page.evaluate(async (xpath, copySelector, delay, tag) => {
      const iterator = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
      const container = iterator.singleNodeValue;
      if (!container) return null;
      const divs = Array.from(container.children).filter(element => element.tagName === tag);
      const lastDiv = divs[divs.length - 1];
      if (!lastDiv) return null;
      const copyBtn = lastDiv.querySelector(copySelector);
      if (!copyBtn) return null;
      copyBtn.click();
      await new Promise(resolve => setTimeout(resolve, delay));
      return await navigator.clipboard.readText();
    }, RESPONSES_CONTAINER_XPATH, COPY_BUTTON_SELECTOR, CLIPBOARD_DELAY, DIV_TAG);
  } catch {
    return null;
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