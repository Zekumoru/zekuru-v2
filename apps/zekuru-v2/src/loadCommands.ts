import { DiscordCommand } from '@zekuru-v2/types';
import { DiscordCommandBuilder } from '@zekuru-v2/utils';
import fs from 'fs';
import path from 'path';

// "entry" because it could either be a folder or a file.
// If it is a folder, it is a command if the folder name
// matches the name of a file within
const commandEntryRegex = /^[\w-]*.(js)?$/i;
const commandsFolder = path.join(__dirname, 'commands');

const getCommandPath = (entry: string): string | undefined => {
  if (entry.endsWith('.js')) {
    return path.join(commandsFolder, entry); // is a file
  }

  const commandPath = path.join(commandsFolder, entry, `${entry}.js`);
  if (!fs.existsSync(commandPath)) return;
  return commandPath;
};

const loadCommands = (): [string, DiscordCommand | DiscordCommandBuilder][] => {
  const commandEntries = fs
    .readdirSync(commandsFolder)
    .filter((entry) => entry.match(commandEntryRegex));

  const commands = commandEntries
    .map<[string, DiscordCommand | DiscordCommandBuilder] | undefined>(
      (entry) => {
        const commandPath = getCommandPath(entry);
        if (!commandPath) return;

        return [commandPath, require(commandPath).default];
      }
    )
    .filter((tuple) => !!tuple);

  return commands;
};

export default loadCommands;
