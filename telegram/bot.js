import TelegramBot from 'node-telegram-bot-api';
import fs from 'fs/promises';
import validateEmail from '../utils/validator.js';
import generateScript from '../lib/scanScript.js';
import { logResult, recordError } from '../utils/memory.js';
import attemptSelfFix from '../utils/selfFix.js';
import dotenv from 'dotenv';
dotenv.config();

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

bot.onText(/\/check (.+)/, async (msg, match) => {
  const email = match[1];
  const chatId = msg.chat.id;

  if (!validateEmail(email)) {
    return bot.sendMessage(chatId, '❌ Invalid email format. Try again.');
  }

  const browserlessURL = `https://chrome.browserless.io/playwright?token=${process.env.BROWSERLESS_TOKEN}`;
  const script = generateScript(email);

  try {
    const result = await fetch(browserlessURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: script })
    });
    const html = await result.text();
    const isRegistered = html.includes("We've sent an email to");
    await logResult(email, isRegistered);

    bot.sendMessage(chatId, isRegistered ? `✅ ${email} is registered.` : `❌ ${email} is not registered.`);
  } catch (err) {
    await recordError(email, err);
    await attemptSelfFix();
    bot.sendMessage(chatId, '⚠️ Auto-healing. Try again later.');
  }
});
