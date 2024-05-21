import crypto from 'crypto';
import { errorDebug } from './logger';

const algorithm = 'aes-256-gcm';
const secretKey = Buffer.from(
  process.env.CIPHER_SECRET_KEY ??
    '58061f4b4543d65ca7967a55ded720355d9b22307c2d665a501dba2d869e1116',
  'hex'
);

/**
 * Encrypts a given text string using AES-256-GCM.
 *
 * @param text The plain text string to be encrypted.
 * @returns A string containing the encrypted text, authentication tag, and initialization vector, concatenated with `|`.
 */
export const encrypt = (text: string) => {
  if (!process.env.CIPHER_SECRET_KEY)
    errorDebug(`[WARNING] Secret key is not set!`);

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  const encrypted = cipher.update(text, 'utf-8', 'hex') + cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return encrypted + '|' + authTag + '|' + Buffer.from(iv).toString('hex');
};

/**
 * Decrypts an encrypted string back to its original text.
 *
 * @param encrypted The encrypted string, which contains the encrypted text, authentication tag, and initialization vector concatenated with `|`.
 * @returns The original plain text string.
 */
export const decrypt = (encrypted: string) => {
  const [encryptedText, authTag, iv] = encrypted.split('|');

  const decipher = crypto.createDecipheriv(
    algorithm,
    secretKey,
    Buffer.from(iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  return (
    decipher.update(encryptedText, 'hex', 'utf-8') + decipher.final('utf-8')
  );
};
