import puppeteer from 'puppeteer';
import express from 'express';

const SUBMIT_BUTTON_XPATH = '::-p-xpath(//*[@id="root"]/div[2]/div/div/div/div[5]/div/div/div[3]//button[not(@disabled)])';
const EMAIL_INPUT_XPATH = '::-p-xpath(//*[@id="root"]/div[2]/div/div/div/div[5]/div/div/div[3]/div[1]/div/div[1]/div/div/div/input)';
const VERIFY_BUTTON_XPATH = '::-p-xpath(//*[@id="root"]/div/main/div/button)';
const HTML_UI = '<!DOCTYPE html><html lang="pt-PT"><head><title>Inserir OTP</title><style>body{display:flex;justify-content:center;align-items:center;height:100vh;background:#000;margin:0;font-family:system-ui}form{display:flex;flex-direction:column;gap:1rem;background:#111;padding:2rem;border-radius:8px;border:1px solid #333}input{padding:1rem;font-size:2rem;text-align:center;letter-spacing:1rem;border-radius:4px;border:1px solid #444;background:#000;color:#fff;outline:none}input:focus{border-color:#fff}button{padding:1rem;background:#fff;color:#000;border:none;border-radius:4px;font-weight:bold;cursor:pointer;font-size:1.1rem}button:hover{background:#ccc}</style></head><body><form onsubmit="event.preventDefault();fetch(\'/verify\',{method:\'POST\',headers:{\'Content-Type\':\'application/json\'},body:JSON.stringify({code:document.getElementById(\'c\').value})}).then(r=>r.json()).then(r=>alert(r.success?\'Enviado com sucesso!\':\'Erro ao enviar\'))"><input id="c" maxlength="6" pattern="\\d{6}" required autofocus autocomplete="off" placeholder="000000"/><button type="submit">Confirmar Código</button></form></body></html>';
const VERIFY_URL_INDICATOR = '/auth/verify-request?email=';
const PERPLEXITY_URL = 'https://www.perplexity.ai/';
const CODE_INPUT_SELECTOR = 'input[inputmode="numeric"]';
const USER_EMAIL = 'joao.vitornl@gmail.com';
const NETWORK_IDLE_EVENT = 'networkidle2';
const SERVER_ERROR_STATUS = 500;
const BAD_REQUEST_STATUS = 400;
const HTTP_OK_STATUS = 200;
const VIEWPORT_HEIGHT = 720;
const VIEWPORT_WIDTH = 1280;
const TYPING_DELAY = 100;
const SERVER_PORT = 3000;
const CODE_LENGTH = 6;

const executeLoginFlow = async (page) => {
  try {
    const emailInput = await page.waitForSelector(EMAIL_INPUT_XPATH, { visible: true });
    if (!emailInput) return false;

    await emailInput.type(USER_EMAIL, { delay: TYPING_DELAY });

    const submitButton = await page.waitForSelector(SUBMIT_BUTTON_XPATH, { visible: true });
    if (!submitButton) return false;

    await submitButton.click();
    return true;
  } catch (error) {
    console.error('\n[ERRO] Falha no fluxo de login:', error.message);
    return false;
  }
};

const processVerificationCode = async (page, code) => {
  try {
    const currentUrl = page.url();
    if (!currentUrl.includes(VERIFY_URL_INDICATOR)) return false;

    const firstCodeInput = await page.waitForSelector(CODE_INPUT_SELECTOR, { visible: true });
    if (!firstCodeInput) return false;

    await firstCodeInput.focus();
    await page.keyboard.type(code, { delay: TYPING_DELAY });

    const verifyButton = await page.waitForSelector(VERIFY_BUTTON_XPATH, { visible: true });
    if (!verifyButton) return false;

    await verifyButton.click();
    return true;
  } catch (error) {
    console.error('\n[ERRO] Falha ao processar código:', error.message);
    return false;
  }
};

const initializeVerificationServer = (page) => {
  const app = express();
  app.use(express.json());

  app.get('/', (_, response) => response.send(HTML_UI));

  app.post('/verify', async (request, response) => {
    const { code } = request.body;
    
    if (!code || code.length !== CODE_LENGTH) {
      return response.status(BAD_REQUEST_STATUS).json({ error: 'InvalidCode' });
    }

    const isVerified = await processVerificationCode(page, code);
    
    if (!isVerified) {
      return response.status(SERVER_ERROR_STATUS).json({ error: 'VerificationFailed' });
    }

    return response.status(HTTP_OK_STATUS).json({ success: true });
  });

  app.listen(SERVER_PORT, () => {
    console.log(`\n[UI] Acesse http://localhost:${SERVER_PORT} para inserir o código OTP.`);
  });
};

const initializeScraper = async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: {
        width: VIEWPORT_WIDTH,
        height: VIEWPORT_HEIGHT,
      },
    });

    const page = await browser.newPage();

    await page.goto(PERPLEXITY_URL, {
      waitUntil: NETWORK_IDLE_EVENT,
    });

    const isLoginStarted = await executeLoginFlow(page);
    if (!isLoginStarted) {
      await browser.close();
      return;
    }

    initializeVerificationServer(page);
  } catch (error) {
    console.error('\n[ERRO] Falha na inicialização do scraper:', error.message);
  }
};

initializeScraper();