import 'dotenv/config';
import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { DiscordEvent } from '@zekuru-v2/types';
import { logger } from '@zekuru-v2/utils';
import { mongodbConnect } from '@zekuru-v2/db';
import { argv } from 'process';
import { register as registerCommands } from './register';

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

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith('.js') && !file.endsWith('.test.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath).default;
  // Set a new item in the Collection with the key as the command name and the
  // value as the exported module
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  } else {
    logger.warn(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
    );
  }
}

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
