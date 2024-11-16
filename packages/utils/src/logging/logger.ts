import pino from 'pino';
import pretty from 'pino-pretty';

export const logger = pino(
  { enabled: process.env.PINO_LOG_DISABLED !== 'true' },
  pretty({
    colorize: true,
    translateTime: 'yyyy-mm-dd HH:MM:ss.l',
  })
);
