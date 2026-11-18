import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logsDir = path.resolve(__dirname, '../../logs');

// Ensure logs directory exists
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const appLogStream = fs.createWriteStream(path.join(logsDir, 'app.log'), { flags: 'a' });
const errorLogStream = fs.createWriteStream(path.join(logsDir, 'error.log'), { flags: 'a' });

function formatLogMessage(level, message, meta = null) {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}\n`;
}

export const logger = {
  info: (message, meta) => {
    const log = formatLogMessage('info', message, meta);
    process.stdout.write(log);
    appLogStream.write(log);
  },
  warn: (message, meta) => {
    const log = formatLogMessage('warn', message, meta);
    process.stdout.write(log);
    appLogStream.write(log);
  },
  error: (message, meta) => {
    const log = formatLogMessage('error', message, meta);
    process.stderr.write(log);
    appLogStream.write(log);
    errorLogStream.write(log);
  },
  httpStream: {
    write: (message) => {
      appLogStream.write(message);
    }
  }
};
