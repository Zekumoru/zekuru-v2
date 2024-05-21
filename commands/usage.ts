import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { createCommand } from '../types/DiscordCommand';
import translatorCache from '../cache/translatorCache';

const data = new SlashCommandBuilder()
  .setName('usage')
  .setDescription('Shows current usage and remaining characters.');

const execute = async (interaction: ChatInputCommandInteraction) => {
  // check if this bot has a translator
  if (!interaction.guildId) return;

  const translator = await translatorCache.get(interaction.guildId);
  if (translator == null) {
    interaction.reply({
      content: `Cannot get usage, no api key found. Please sign in using the \`sign-in\` command.`,
    });
    return;
  }

  const usage = await translator.getUsage();
  if (!usage.character) {
    await interaction.reply('An error occurred. Could not get usage.');
    return;
  }

  if (usage.character.limitReached()) {
    await interaction.reply('Usage limit has been reached!');
    return;
  }

  const { count, limit } = usage.character;
  const remaining = limit - count;
  await interaction.reply(
    `Usage count: **${count.toLocaleString('en-US')} / ${limit.toLocaleString(
      'en-US'
    )} characters**; Remaining: **${remaining.toLocaleString(
      'en-US'
    )} characters**.`
  );
};

export default createCommand({
  cooldown: 5,
  data,
  execute,
});
