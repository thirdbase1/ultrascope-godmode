import { runInstagramCheck } from '../../lib/scanScript.js';
import { isValidEmail } from '../../utils/validator.js';
import { saveResult, saveError } from '../../utils/memory.js';

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { emails } = req.body;
  if (!Array.isArray(emails)) return res.status(400).json({ error: 'Invalid input' });

  const results = [];

  for (const email of emails) {
    if (!isValidEmail(email)) continue;

    let finalResult;

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const result = await runInstagramCheck(email);
        finalResult = { email, registered: result.registered, attempt };
        saveResult(finalResult);
        break;
      } catch (err) {
        if (attempt === 2) {
          finalResult = { email, error: err.message, failed: true };
          saveError(finalResult);
        }
        await delay(2000);
      }
    }

    results.push(finalResult);
  }

  res.status(200).json({ scanned: results.length, results });
}
