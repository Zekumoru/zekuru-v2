import amqp from 'amqplib';
import amqpConnectionPromise from './rabbitMqConnect';

export const TranslateQueueName = 'translate-queue';

export interface TranslateQueueData {}

const amqpChannelPromise = (async () => {
  const connection = await amqpConnectionPromise;
  const channel = await connection.createChannel();
  await channel.assertQueue(TranslateQueueName, { durable: true });
  return channel;
})();

const produce = async (data: TranslateQueueData) => {
  const channel = await amqpChannelPromise;
  const stringified = JSON.stringify(data);

  return channel.sendToQueue(TranslateQueueName, Buffer.from(stringified), {
    persistent: true,
  });
};

const translateQueue = {
  produce,
};

export default translateQueue;
