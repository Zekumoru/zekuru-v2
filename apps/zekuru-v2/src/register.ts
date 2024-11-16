import 'dotenv/config';
import {
  REST,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
} from 'discord.js';
import fs from 'fs';
import path from 'path';
import { argv, exit } from 'process';
import { DiscordCommand } from '@zekuru-v2/types';
import { asyncExec, logger } from '@zekuru-v2/utils';

// check whether to deploy globally or locally to guild development
const isGlobal = argv.some(
  (option) => option === '--global' || option === '-g'
);

// get ids and tokens
const clientId = process.env.CLIENT_ID;
if (!clientId) logger.error('Missing client id.');
const guildId = process.env.GUILD_ID;
if (!guildId) logger.error('Missing guild id.');
const token = process.env.DISCORD_TOKEN;
if (!token) logger.error('Missing Discord token.');

if (!clientId || !guildId || !token) {
  exit(1);
}

const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

// Grab all the commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith('.js') && !file.endsWith('.test.js'));

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath).default as DiscordCommand;

  if ('data' in command && 'execute' in command) {
    // Do not deploy commands that are for development only
    if (!(isGlobal && command.devOnly)) commands.push(command.data.toJSON());
  } else {
    logger.warn(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
    );
  }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// Deploy commands
interface RestResult {
  length: number;
}

export const register = async () => {
  logger.info(
    `Started refreshing${isGlobal ? ' globally ' : ' '}${
      commands.length
    } application (/) commands.`
  );

  const route = isGlobal
    ? Routes.applicationCommands(clientId)
    : Routes.applicationGuildCommands(clientId, guildId);

  // The put method is used to fully refresh all
  // commands in the guild with the current set
  const [data, error] = await asyncExec(
    rest.put(route, { body: commands }) as Promise<RestResult>
  );

  if (!data) {
    logger.error(
      error,
      `An error has occurred while registering the commands.`
    );
    return;
  }

  logger.info(`Successfully reloaded ${data.length} application (/) commands.`);
};
