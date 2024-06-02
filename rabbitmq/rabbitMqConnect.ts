import amqp from 'amqplib';
import { appDebug, errorDebug } from '../utilities/logger';

const amqpString = process.env.AMQP_CONNECTION_STRING;

const amqpConnectionPromise = (async () => {
  if (!amqpString) throw new Error('AMQP connection string is undefined');

  const connection = await amqp.connect(amqpString);
  appDebug(`Successfully connected to amqp`);

  return connection;
})();

amqpConnectionPromise.catch((error: { message: string }) => {
  errorDebug(`Cannot connect to amqp: ${error.message}`);
});

export const closeAmqpConnection = async () => {
  const connection = await amqpConnectionPromise;
  await connection.close();
};

export default amqpConnectionPromise;
