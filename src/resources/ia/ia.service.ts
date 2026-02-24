import puppeteer from "puppeteer";

import { ANONYMOUS_MODE_BUTTON_SELECTOR, RESPONSES_CONTAINER_XPATH, VERIFY_BUTTON_SELECTOR, LOGIN_MODAL_SELECTOR, EMAIL_INPUT_SELECTOR, STOP_BUTTON_SELECTOR, COPY_BUTTON_SELECTOR, CODE_INPUT_SELECTOR, ASK_INPUT_SELECTOR, VERIFY_URL_INDICATOR, NETWORK_IDLE_EVENT, GENERATION_TIMEOUT, PROTOCOL_TIMEOUT, CLIPBOARD_WRITE, CLIPBOARD_READ, PERPLEXITY_URL, CLIPBOARD_DELAY, TYPING_DELAY, BUTTON_WAIT, USER_EMAIL, ENTER_KEY, DIV_TAG, PUPPETEER_ARGS, USER_AGENT, ACCEPT_LANGUAGE, IS_DOCKER } from "./ia.constants";
import logger from "@utils/functions/logger";

import type { Browser, Page } from "puppeteer";

let browserInstance: Browser | null = null;
let pageInstance: Page | null = null;

export const executeLoginFlow = async (): Promise<boolean> => {
    logger.info("[executeLoginFlow] Iniciando fluxo de login");
    if (!pageInstance) return false;
    try {
        try {
            logger.info("[executeLoginFlow] Aguardando modal de login");
            const signInButton = await pageInstance.waitForSelector(LOGIN_MODAL_SELECTOR, { visible: true, timeout: BUTTON_WAIT });
            if (signInButton) {
                await signInButton.click();
                await new Promise(r => setTimeout(r, 1000));
            }
        } catch {}
        logger.info("[executeLoginFlow] Aguardando input de email");
        const emailInput = await pageInstance.waitForSelector(EMAIL_INPUT_SELECTOR, { visible: true });
        if (!emailInput) return false;
        logger.info("[executeLoginFlow] Inserindo email");
        await emailInput.type(USER_EMAIL, { delay: TYPING_DELAY });
        await pageInstance.keyboard.press(ENTER_KEY);
        logger.success("[executeLoginFlow] Fluxo de login submetido");
        return true;
    } catch (error) {
        logger.error(`[executeLoginFlow] ${error}`);
        return false;
    }
};

export const initializeScraper = async (): Promise<void> => {
    logger.info("[initializeScraper] Iniciando scraper");
    try {
        const launchOptions = IS_DOCKER ? { headless: true, defaultViewport: null, args: PUPPETEER_ARGS, timeout: PROTOCOL_TIMEOUT, protocolTimeout: PROTOCOL_TIMEOUT } : { headless: false, defaultViewport: null, args: PUPPETEER_ARGS, executablePath: process.env.PUPPETEER_EXECUTABLE_PATH, timeout: PROTOCOL_TIMEOUT, protocolTimeout: PROTOCOL_TIMEOUT };
        browserInstance = await puppeteer.launch(launchOptions);
        const context = browserInstance.defaultBrowserContext();
        await context.overridePermissions(PERPLEXITY_URL, [CLIPBOARD_READ, CLIPBOARD_WRITE]);
        pageInstance = await browserInstance.newPage();
        await pageInstance.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
            Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
            Object.defineProperty(navigator, 'languages', { get: () => ['pt-BR', 'pt', 'en-US', 'en'] });
        });
        await pageInstance.setUserAgent(USER_AGENT);
        await pageInstance.setExtraHTTPHeaders({ 'Accept-Language': ACCEPT_LANGUAGE });
        logger.info("[initializeScraper] Navegando para URL base");
        await pageInstance.goto(PERPLEXITY_URL, { waitUntil: NETWORK_IDLE_EVENT });
        const isLoginStarted = await executeLoginFlow();
        if (!isLoginStarted) await browserInstance.close();
        logger.success("[initializeScraper] Scraper inicializado com sucesso");
    } catch (error) {
        logger.error(`[initializeScraper] ${error}`);
        process.exit(1);
    }
};

export const processVerificationCode = async (code: string): Promise<boolean> => {
    logger.info("[processVerificationCode] Iniciando processamento do codigo de verificacao");
    if (!pageInstance) return false;
    try {
        if (!pageInstance.url().includes(VERIFY_URL_INDICATOR)) return false;
        logger.info("[processVerificationCode] Aguardando input do codigo");
        const firstCodeInput = await pageInstance.waitForSelector(CODE_INPUT_SELECTOR, { visible: true });
        if (!firstCodeInput) return false;
        await firstCodeInput.focus();
        logger.info("[processVerificationCode] Inserindo codigo");
        await pageInstance.keyboard.type(code, { delay: TYPING_DELAY });
        try {
            const verifyButton = await pageInstance.waitForSelector(VERIFY_BUTTON_SELECTOR, { visible: true, timeout: BUTTON_WAIT });
            if (verifyButton) await verifyButton.click();
        } catch {
            await pageInstance.keyboard.press(ENTER_KEY);
        }
        logger.success("[processVerificationCode] Codigo submetido com sucesso");
        return true;
    } catch (error) {
        logger.error(`[processVerificationCode] ${error}`);
        return false;
    }
};

export const enableAnonymousMode = async (): Promise<boolean> => {
    logger.info("[enableAnonymousMode] Tentando ativar modo anonimo");
    if (!pageInstance) return false;
    try {
        const button = await pageInstance.waitForSelector(ANONYMOUS_MODE_BUTTON_SELECTOR, { visible: true });
        if (!button) return false;
        await button.click();
        logger.success("[enableAnonymousMode] Modo anonimo ativado");
        return true;
    } catch {
        logger.warning("[enableAnonymousMode] Botao nao encontrado ou erro ao ativar");
        return false;
    }
};

export const getAIResponseText = async (): Promise<string | null> => {
    logger.info("[getAIResponseText] Aguardando resposta da IA");
    if (!pageInstance) return null;
    try {
        await pageInstance.waitForSelector(STOP_BUTTON_SELECTOR, { visible: true, timeout: BUTTON_WAIT }).catch(() => {});
        logger.info("[getAIResponseText] Geracao de texto iniciada, aguardando conclusao");
        await pageInstance.waitForSelector(STOP_BUTTON_SELECTOR, { hidden: true, timeout: GENERATION_TIMEOUT });
        logger.info("[getAIResponseText] Extraindo texto copiado");
        const result = await pageInstance.evaluate(async (xpath: string, copySelector: string, delay: number, tag: string) => {
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
        logger.success("[getAIResponseText] Resposta capturada com sucesso");
        return result;
    } catch (error) {
        logger.error(`[getAIResponseText] ${error}`);
        return null;
    }
};

export const sendPromptToAI = async (prompt: string): Promise<boolean> => {
    logger.info("[sendPromptToAI] Preparando envio de prompt");
    if (!pageInstance) return false;
    try {
        const input = await pageInstance.waitForSelector(ASK_INPUT_SELECTOR, { visible: true });
        if (!input) return false;
        await input.focus();
        logger.info("[sendPromptToAI] Inserindo prompt na caixa de texto");
        await pageInstance.keyboard.type(prompt, { delay: TYPING_DELAY });
        await pageInstance.keyboard.press(ENTER_KEY);
        logger.success("[sendPromptToAI] Prompt enviado");
        return true;
    } catch (error) {
        logger.error(`[sendPromptToAI] ${error}`);
        return false;
    }
};

export const resetPage = async (): Promise<boolean> => {
    logger.info("[resetPage] Reiniciando pagina");
    if (!pageInstance) return false;
    try {
        await pageInstance.goto(PERPLEXITY_URL, { waitUntil: NETWORK_IDLE_EVENT });
        logger.success("[resetPage] Pagina reiniciada");
        return true;
    } catch (error) {
        logger.error(`[resetPage] ${error}`);
        return false;
    }
};