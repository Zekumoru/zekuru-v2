import { CredentialUtil, DeepLCredential } from '@zekuru-v2/entities';
import { WithGuild } from '@zekuru-v2/types';
import { ChatInputCommandInteraction } from 'discord.js';
import GuildCache from '../../../../cache/GuildCache';
import isAlreadyRegistered from '../isAlreadyRegistered';

const deeplRegisterHandler = async (
  interaction: WithGuild<ChatInputCommandInteraction>
): Promise<void> => {
  const guildId = interaction.guildId;

  // check if already exists
  if (await isAlreadyRegistered(guildId, 'deepl')) {
    interaction.reply(
      'Deepl is already registered. Do you wish to change API key? Unregister first.'
    );
    return;
  }

  // add key to guild
  const key = interaction.options.getString('key', true);
  const userId = interaction.user.id;
  const guild = await GuildCache.get(guildId);

  const credential: CredentialUtil<DeepLCredential> = {
    type: 'deepl',
    apiKey: key,
    createdBy: userId,
  };

  if (!guild) {
    // create guild if it doesn't exist
    await GuildCache.set(guildId, {
      _id: guildId,
      translation: {
        credentials: [credential as DeepLCredential],
      },
      createdBy: userId,
      modifiedBy: userId,
    });
  } else {
    guild.addCredential(credential);
    await GuildCache.set(guildId, guild);
  }

  interaction.reply({
    content: 'Deepl has been registered.',
    ephemeral: true,
  });
};

export default deeplRegisterHandler;
