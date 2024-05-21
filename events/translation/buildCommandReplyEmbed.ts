import { Message, MessageType } from 'discord.js';
import buildEmbed from '../../commands/utilities/buildEmbed';
import { SourceLanguageCode, TargetLanguageCode } from 'deepl-node';
import translateContent from './translateContent';

const buildCommandReplyEmbed = async (
  message: Message,
  sourceLang: SourceLanguageCode,
  targetLang: TargetLanguageCode
) => {
  if (message.type !== MessageType.ChatInputCommand) return;
  if (!message.interaction) return;
  if (!message.guildId) return;

  const content = `Used`;
  const translatedContent = await translateContent(
    content,
    message.guildId,
    sourceLang,
    targetLang
  );
  if (!translatedContent) return;

  const author = message.interaction.user;
  const member = message.guild?.members.cache.get(author.id);

  return {
    embed: buildEmbed(
      member?.nickname ?? message.author.displayName,
      member?.avatarURL({ size: 32 }) ?? author.displayAvatarURL({ size: 32 }),
      `${translatedContent.content}: \`/${message.interaction.commandName}\``
    ),
    message: message,
  };
};

export default buildCommandReplyEmbed;
