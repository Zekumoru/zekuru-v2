import { CredentialUtil, DeepLCredential } from '@zekuru-v2/entities';
import { ChatInputCommandInteraction } from 'discord.js';
import GuildCache from '../../../../cache/GuildCache';
import isAlreadyRegistered from '../isAlreadyRegistered';
import { encrypt } from '@zekuru-v2/utils';
import { InGuild } from '@zekuru-v2/types';
import * as deepl from 'deepl-node';

const deeplRegisterHandler = async (
  interaction: InGuild<ChatInputCommandInteraction>
): Promise<void> => {
  const guildId = interaction.guildId;

  // check if already exists
  if (await isAlreadyRegistered(guildId, 'deepl')) {
    interaction.editReply(
      'Deepl is already registered. Do you wish to change API key? Unregister first.'
    );
    return;
  }

  // add key to guild
  const key = interaction.options.getString('key', true);
  const userId = interaction.user.id;
  const guild = await GuildCache.get(guildId);

  // check if valid key, throws error if not
  await new deepl.Translator(key).getUsage();

  const encryptedKey = encrypt(key);
  const credential: CredentialUtil<DeepLCredential> = {
    type: 'deepl',
    apiKey: encryptedKey,
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

  interaction.editReply({
    content: 'Deepl has been registered.',
  });
};

export default deeplRegisterHandler;
