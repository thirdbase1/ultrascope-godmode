import fs from 'fs';
import path from 'path';

const resultsPath = path.join(process.cwd(), 'memory', 'results.json');
const errorsPath = path.join(process.cwd(), 'memory', 'errors.json');

export function saveResult(entry) {
  const data = readJson(resultsPath);
  data.push(entry);
  fs.writeFileSync(resultsPath, JSON.stringify(data, null, 2));
}

export function saveError(entry) {
  const data = readJson(errorsPath);
  data.push(entry);
  fs.writeFileSync(errorsPath, JSON.stringify(data, null, 2));
}

function readJson(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
