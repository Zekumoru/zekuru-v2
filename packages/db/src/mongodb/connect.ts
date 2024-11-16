import { asyncExec, logger } from '@zekuru-v2/utils';
import mongoose from 'mongoose';

const dbString = process.env.MONGODB_CONNECTION_STRING;

export const mongodbConnect = async () => {
  if (!dbString) {
    logger.error('Missing mongodb connection string.');
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, error] = await asyncExec(mongoose.connect(dbString));

  if (error) {
    logger.error(error, 'Cannot connect to mongodb.');
    return;
  }

  logger.info('Successfully connected to mongodb.');
};
