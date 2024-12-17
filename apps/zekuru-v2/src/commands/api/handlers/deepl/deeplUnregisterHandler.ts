import { WithGuild } from '@zekuru-v2/types';
import isAlreadyRegistered from '../isAlreadyRegistered';
import { ChatInputCommandInteraction } from 'discord.js';
import GuildCache from '../../../../cache/GuildCache';
import TranslatorManagerCache from '../../../../cache/TranslatorManagerCache';

const deeplUnregisterHandler = async (
  interaction: WithGuild<ChatInputCommandInteraction>
): Promise<void> => {
  const guildId = interaction.guildId;

  const registered = await isAlreadyRegistered(guildId, 'deepl');
  if (!registered) {
    interaction.editReply(
      'Deepl is not registered yet. Are you trying to register? Use the `/api register deepl` command.'
    );
    return;
  }

  const guild = await GuildCache.get(guildId, true);
  guild.removeCredential('deepl');

  const manager = await TranslatorManagerCache.get(guildId);
  manager.delete('deepl');

  await GuildCache.set(guildId, guild);

  interaction.editReply({
    content: 'Deepl has been unregistered.',
  });
};

export default deeplUnregisterHandler;
