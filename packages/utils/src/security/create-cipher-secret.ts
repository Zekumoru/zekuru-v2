import crypto from 'crypto';
import { logger } from '../logging/logger';

const secretKey = Buffer.from(crypto.randomBytes(32)).toString('hex');

logger.info({ secretKey }, `Your new cipher secret key is: ${secretKey}`);
