import 'dotenv/config';
import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { DiscordEvent } from '@zekuru-v2/types';
import { DiscordCommandBuilder, logger } from '@zekuru-v2/utils';
import { mongodbConnect } from '@zekuru-v2/db';
import { argv } from 'process';
import { register as registerCommands } from './register';
import loadCommands from './loadCommands';

mongodbConnect();

// check whether to register commands
const toRegister = argv.some(
  (option) => option === '--register' || option === '-r'
);
if (toRegister) {
  registerCommands();
}

const token = process.env.DISCORD_TOKEN;

/**
 * GatewayIntentBits.Guilds
 *  - It ensures that the caches for guilds, channels, and roles are populated
 *    and available for internal use.
 *  - The term "guild" is used by the Discord API and in discord.js to refer
 *    to a Discord server.
 *  - Intents also define which events Discord should send to your bot, and you
 *    may wish to enable more than just the minimum.
 */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
  rest: {
    timeout: 10 * 1000, // 10s
    retries: 5,
  },
});

client.commands = new Collection();
client.cooldowns = new Collection();

// Push commands to the client.commands collection
loadCommands().map(([path, command]) => {
  // Set a new item in the Collection with the key as the command name and the
  // value as the exported module
  if ('data' in command && 'execute' in command) {
    // OLD STRUCTURING OF COMMANDS, WILL BE DEPRECATED LATER
    client.commands.set(command.data.name, command);
  } else if (command instanceof DiscordCommandBuilder) {
    client.commands.set(command.name, command);
  } else {
    logger.warn(
      `[WARNING] The command at ${path} is missing a required "data" or "execute" property.`
    );
  }
});

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath).default as DiscordEvent;

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.login(token);
