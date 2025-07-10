import fs from 'fs/promises';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API });
const sourceFile = './lib/scanScript.js';

export default async function attemptSelfFix() {
  try {
    const current = await fs.readFile(sourceFile, 'utf-8');
    const prompt = `Fix this Playwright script if IG changed.\n\n${current}`;
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a repair bot.' },
        { role: 'user', content: prompt }
      ]
    });
    const fixed = response.choices[0].message.content;
    if (fixed.includes('chromium')) {
      await fs.writeFile(sourceFile, fixed);
    }
  } catch (err) {
    console.error('Fix failed:', err.message);
  }
}
