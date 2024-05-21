import { BaseGuildTextChannel, Collection, Webhook } from 'discord.js';

// webhooks are created using guild id so there's
// only one webhook for every server

// key is channel id, value is webhook
const cacheWebhookIds = new Collection<string, Webhook>();

const get = async (channel: BaseGuildTextChannel) => {
  // find first if the webhook is in cache
  const webhookCache = cacheWebhookIds.get(channel.id);
  if (webhookCache) return webhookCache;

  // otherwise find the webhook and put it in cache
  const webhooks = await channel.fetchWebhooks();
  const webhook = webhooks.find(
    // as stated before, one webhook per guild
    (webhook) => webhook.guildId === channel.guildId
  );
  if (webhook) {
    cacheWebhookIds.set(channel.id, webhook);
    return webhook;
  }

  // ultimately, create a new webhook
  const newWebhook = await channel.createWebhook({ name: `Zekuru-v2 Webhook` });
  cacheWebhookIds.set(channel.id, newWebhook);
  return newWebhook;
};

export default {
  get,
};
