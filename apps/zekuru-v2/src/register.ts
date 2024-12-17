import 'dotenv/config';
import {
  REST,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
} from 'discord.js';
import { argv, exit } from 'process';
import { asyncExec, DiscordCommandBuilder, logger } from '@zekuru-v2/utils';
import loadCommands from './loadCommands';

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

loadCommands().map(([path, command]) => {
  if ('data' in command && 'execute' in command) {
    // OLD STRUCTURING OF A COMMAND, TO BE DEPRECATED
    // DON'T FORGET TO ADJUST THE WARNING BELOW
    // Do not deploy commands that are for development only
    if (!(isGlobal && command.devOnly)) commands.push(command.data.toJSON());
  } else if (command instanceof DiscordCommandBuilder) {
    // Do not deploy commands that are for development only
    if (!(isGlobal && command.devOnly)) commands.push(command.toJSON());
  } else {
    logger.warn(
      `[WARNING] The command at ${path} is missing a required "data" or "execute" property.`
    );
  }
});

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
