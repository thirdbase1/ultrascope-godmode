import { isValidEmail } from '../utils/validator.js';
import { runInstagramCheck } from '../lib/scanScript.js';
import { saveResult, saveError } from '../utils/memory.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email } = req.body;
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    const attempt = await runInstagramCheck(email);
    const entry = {
      email,
      registered: attempt.registered,
      timestamp: Date.now(),
    };

    saveResult(entry);

    res.status(200).json({
      ...entry,
      message: entry.registered
        ? '✅ Email is linked to an Instagram account.'
        : '❌ Email is not linked to any Instagram account.',
    });

  } catch (err) {
    saveError({ email, error: err.message, time: Date.now() });

    // Simple auto-retry once
    try {
      const retry = await runInstagramCheck(email);
      const entry = {
        email,
        registered: retry.registered,
        retried: true,
        timestamp: Date.now(),
      };

      saveResult(entry);
      return res.status(200).json({
        ...entry,
        message: entry.registered
          ? '✅ Email (after retry) is linked to an Instagram account.'
          : '❌ Email (after retry) is not linked.',
      });

    } catch (finalError) {
      saveError({ email, error: finalError.message, retried: true });
      res.status(500).json({ message: 'Final retry failed.', error: finalError.message });
    }
  }
}
