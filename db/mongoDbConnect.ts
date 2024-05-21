import mongoose from 'mongoose';
import { appDebug } from '../utils/logger';

const dbString = process.env.MONGODB_CONNECTION_STRING;

(async () => {
  if (!dbString) throw new Error('Mongodb connection string is undefined');

  await mongoose.connect(dbString);
  appDebug(`Successfully connected to mongodb`);
})().catch((error: { message: string }) => {
  appDebug(`Cannot connect to db: ${error.message}`);
});
