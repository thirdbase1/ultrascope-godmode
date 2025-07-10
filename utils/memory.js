import fs from 'fs/promises';
const resultPath = './memory/results.json';
const errorPath = './memory/errors.json';

export async function logResult(email, status) {
  const data = { email, status, timestamp: new Date().toISOString() };
  const logs = await readJson(resultPath);
  logs.push(data);
  await fs.writeFile(resultPath, JSON.stringify(logs, null, 2));
}

export async function recordError(email, error) {
  const logs = await readJson(errorPath);
  logs.push({ email, error: error.message, time: new Date().toISOString() });
  await fs.writeFile(errorPath, JSON.stringify(logs, null, 2));
}

async function readJson(path) {
  try {
    const file = await fs.readFile(path, 'utf-8');
    return JSON.parse(file);
  } catch {
    return [];
  }
}
