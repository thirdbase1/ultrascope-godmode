import { config } from 'dotenv';
config();
import generateScript from '../lib/scanScript.js';
import validateEmail from '../utils/validator.js';
import { logResult, recordError } from '../utils/memory.js';
import attemptSelfFix from '../utils/selfFix.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const { email } = req.body;
  if (!validateEmail(email)) return res.status(400).json({ error: 'Invalid email format' });

  const browserlessToken = process.env.BROWSERLESS_TOKEN;
  const browserlessURL = `https://chrome.browserless.io/playwright?token=${browserlessToken}`;
  const script = generateScript(email);

  try {
    const result = await fetch(browserlessURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: script }),
    });

    const html = await result.text();
    const isRegistered = html.includes("We've sent an email to");

    await logResult(email, isRegistered);
    res.json({
      email,
      registered: isRegistered,
      message: isRegistered
        ? '✅ Email is linked to an Instagram account.'
        : '❌ Email is not linked.',
    });
  } catch (err) {
    await recordError(email, err);
    await attemptSelfFix();
    res.status(500).json({ error: 'UltraScope encountered a disruption and is auto-healing.' });
  }
}
