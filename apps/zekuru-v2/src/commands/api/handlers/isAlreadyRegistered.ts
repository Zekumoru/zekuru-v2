import { Snowflake } from '@zekuru-v2/types';
import { TranslatorTypes } from '../../../translation/Translator';
import TranslatorManagerCache from '../../../cache/TranslatorManagerCache';
import GuildCache from '../../../cache/GuildCache';

const isAlreadyRegistered = async (
  guildId: Snowflake,
  type: TranslatorTypes
): Promise<boolean> => {
  const manager = await TranslatorManagerCache.get(guildId);
  if (await manager.get(type, guildId)) {
    return true;
  }

  const guild = await GuildCache.get(guildId);
  if (!guild) return false;

  const savedApiKey = guild.translation.credentials.find(
    (credential) => credential.type === type
  );
  return !!savedApiKey;
};

export default isAlreadyRegistered;
