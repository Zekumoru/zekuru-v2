import crypto from 'crypto';

const secretKey = Buffer.from(crypto.randomBytes(32)).toString('hex');

console.log(`Your new cipher secret key is: ${secretKey}`);
