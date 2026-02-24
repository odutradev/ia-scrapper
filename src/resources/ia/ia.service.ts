import puppeteer from "puppeteer";

import { ANONYMOUS_MODE_BUTTON_SELECTOR, RESPONSES_CONTAINER_XPATH, VERIFY_URL_INDICATOR, SUBMIT_BUTTON_XPATH, VERIFY_BUTTON_XPATH, EMAIL_INPUT_XPATH, STOP_BUTTON_SELECTOR, COPY_BUTTON_SELECTOR, CODE_INPUT_SELECTOR, ASK_INPUT_SELECTOR, NETWORK_IDLE_EVENT, GENERATION_TIMEOUT, CLIPBOARD_WRITE, CLIPBOARD_READ, PERPLEXITY_URL, VIEWPORT_HEIGHT, VIEWPORT_WIDTH, CLIPBOARD_DELAY, TYPING_DELAY, BUTTON_WAIT, USER_EMAIL, ENTER_KEY, DIV_TAG } from "./ia.constants";
import defaultConfig from "@assets/config/default";
import logger from "@utils/functions/logger";

import type { Browser, Page } from "puppeteer";

let browserInstance: Browser | null = null;
let pageInstance: Page | null = null;

export const executeLoginFlow = async (): Promise<boolean> => {
    if (!pageInstance) {
        logger.error("[executeLoginFlow] pageInstance is null");
        return false;
    }
    try {
        logger.info("[executeLoginFlow] Iniciando fluxo de login...");
        const emailInput = await pageInstance.waitForSelector(EMAIL_INPUT_XPATH, { visible: true });
        if (!emailInput) {
            logger.error("[executeLoginFlow] Campo de email não encontrado");
            return false;
        }
        logger.info(`[executeLoginFlow] Preenchendo email: ${USER_EMAIL}`);
        await emailInput.type(USER_EMAIL, { delay: TYPING_DELAY });
        const submitButton = await pageInstance.waitForSelector(SUBMIT_BUTTON_XPATH, { visible: true });
        if (!submitButton) {
            logger.error("[executeLoginFlow] Botão de submit não encontrado");
            return false;
        }
        logger.info("[executeLoginFlow] Clicando no botão de submit...");
        await submitButton.click();
        logger.success("[executeLoginFlow] Fluxo de login finalizado (aguardando email com código)");
        return true;
    } catch (error) {
        logger.error(`[executeLoginFlow] Falha durante o fluxo de login: ${error}`);
        return false;
    }
};

export const initializeScraper = async (): Promise<void> => {
    try {
        logger.info("[initializeScraper] Iniciando browser...");
        browserInstance = await puppeteer.launch({ headless: defaultConfig.mode == "production" ? true : false, defaultViewport: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT } });
        const context = browserInstance.defaultBrowserContext();
        await context.overridePermissions(PERPLEXITY_URL, [CLIPBOARD_READ, CLIPBOARD_WRITE]);
        pageInstance = await browserInstance.newPage();
        logger.info("[initializeScraper] Navegando para PERPLEXITY_URL...");
        await pageInstance.goto(PERPLEXITY_URL, { waitUntil: NETWORK_IDLE_EVENT });
        const isLoginStarted = await executeLoginFlow();
        if (!isLoginStarted) {
            logger.error("[initializeScraper] Falha ao iniciar fluxo de login, fechando browser...");
            await browserInstance.close();
        }
    } catch (error) {
        logger.error(`[initializeScraper] Erro crítico na inicialização: ${error}`);
        process.exit(1);
    }
};

export const processVerificationCode = async (code: string): Promise<boolean> => {
    if (!pageInstance) {
        logger.error("[processVerificationCode] pageInstance is null");
        return false;
    }
    try {
        logger.info(`[processVerificationCode] Iniciando verificação com código: ${code}`);
        if (!pageInstance.url().includes(VERIFY_URL_INDICATOR)) {
            logger.warning(`[processVerificationCode] URL não contém indicador de verificação. URL atual: ${pageInstance.url()}`);
            return false;
        }
        const firstCodeInput = await pageInstance.waitForSelector(CODE_INPUT_SELECTOR, { visible: true });
        if (!firstCodeInput) {
            logger.error("[processVerificationCode] Input de código não encontrado");
            return false;
        }
        logger.info("[processVerificationCode] Focando e digitando o código...");
        await firstCodeInput.focus();
        await pageInstance.keyboard.type(code, { delay: TYPING_DELAY });
        const verifyButton = await pageInstance.waitForSelector(VERIFY_BUTTON_XPATH, { visible: true });
        if (!verifyButton) {
            logger.error("[processVerificationCode] Botão de verificação não encontrado");
            return false;
        }
        logger.info("[processVerificationCode] Clicando no botão de verificação...");
        await verifyButton.click();
        logger.success("[processVerificationCode] Código de verificação processado com sucesso");
        return true;
    } catch (error) {
        logger.error(`[processVerificationCode] Falha ao processar código: ${error}`);
        return false;
    }
};

export const enableAnonymousMode = async (): Promise<boolean> => {
    if (!pageInstance) return false;
    try {
        const button = await pageInstance.waitForSelector(ANONYMOUS_MODE_BUTTON_SELECTOR, { visible: true });
        if (!button) return false;
        await button.click();
        return true;
    } catch {
        return false;
    }
};

export const getAIResponseText = async (): Promise<string | null> => {
    if (!pageInstance) return null;
    try {
        await pageInstance.waitForSelector(STOP_BUTTON_SELECTOR, { visible: true, timeout: BUTTON_WAIT }).catch(() => {});
        await pageInstance.waitForSelector(STOP_BUTTON_SELECTOR, { hidden: true, timeout: GENERATION_TIMEOUT });
        return await pageInstance.evaluate(async (xpath: string, copySelector: string, delay: number, tag: string) => {
            const iterator = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
            const container = iterator.singleNodeValue as Element | null;
            if (!container) return null;
            const divs = Array.from(container.children).filter(element => element.tagName === tag);
            const lastDiv = divs[divs.length - 1];
            if (!lastDiv) return null;
            const copyBtn = lastDiv.querySelector(copySelector) as HTMLButtonElement | null;
            if (!copyBtn) return null;
            copyBtn.click();
            await new Promise(resolve => setTimeout(resolve, delay));
            return await navigator.clipboard.readText();
        }, RESPONSES_CONTAINER_XPATH, COPY_BUTTON_SELECTOR, CLIPBOARD_DELAY, DIV_TAG);
    } catch {
        return null;
    }
};

export const sendPromptToAI = async (prompt: string): Promise<boolean> => {
    if (!pageInstance) return false;
    try {
        const input = await pageInstance.waitForSelector(ASK_INPUT_SELECTOR, { visible: true });
        if (!input) return false;
        await input.focus();
        await pageInstance.keyboard.type(prompt, { delay: TYPING_DELAY });
        await pageInstance.keyboard.press(ENTER_KEY);
        return true;
    } catch {
        return false;
    }
};

export const resetPage = async (): Promise<boolean> => {
    if (!pageInstance) return false;
    try {
        await pageInstance.goto(PERPLEXITY_URL, { waitUntil: NETWORK_IDLE_EVENT });
        return true;
    } catch {
        return false;
    }
};