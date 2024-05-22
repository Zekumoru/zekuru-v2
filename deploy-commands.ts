import 'dotenv/config';
import {
  REST,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
} from 'discord.js';
import fs from 'fs';
import path from 'path';
import { argv } from 'process';
import { DiscordCommand } from './types/DiscordCommand';

// check whether to deploy globally or locally to guild development
const isGlobal = argv.some(
  (option) => option === '--global' || option === '-g'
);

// get ids and tokens
const clientId = process.env.CLIENT_ID!;
const guildId = process.env.GUILD_ID!;
const token = process.env.DISCORD_TOKEN!;

const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

// Grab all the commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith('.ts'));

// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath).default as DiscordCommand;

  if ('data' in command && 'execute' in command) {
    // Do not deploy commands that are for development only
    if (!(isGlobal && command.devOnly)) commands.push(command.data.toJSON());
  } else {
    console.warn(
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

(async () => {
  try {
    console.log(
      `Started refreshing${isGlobal ? ' globally ' : ' '}${
        commands.length
      } application (/) commands.`
    );

    const route = isGlobal
      ? Routes.applicationCommands(clientId)
      : Routes.applicationGuildCommands(clientId, guildId);

    // The put method is used to fully refresh all commands in the guild with
    // the current set
    const data = (await rest.put(route, { body: commands })) as RestResult;

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    console.error(error);
  }
})();
