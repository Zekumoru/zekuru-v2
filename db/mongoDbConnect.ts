import mongoose from 'mongoose';
import { appDebug, errorDebug } from '../utilities/logger';

const dbString = process.env.MONGODB_CONNECTION_STRING;

const mongoDbPromise = (async () => {
  if (!dbString) throw new Error('Mongodb connection string is undefined');

  const mongoDb = await mongoose.connect(dbString);
  appDebug(`Successfully connected to mongodb`);

  return mongoDb;
})();

mongoDbPromise.catch((error: { message: string }) => {
  errorDebug(`Cannot connect to db: ${error.message}`);
});

export const closeMongoDb = async () => {
  const mongoDb = await mongoDbPromise;
  await mongoDb.disconnect();
};

export default mongoDbPromise;
