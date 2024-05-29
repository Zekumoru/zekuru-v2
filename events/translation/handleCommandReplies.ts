import { ChannelType, Message, MessageType } from 'discord.js';
import { Language, codeLanguagesMap } from '../../translation/languages';
import cache from '../../cache';
import { ITranslateChannel } from '../../db/models/TranslateChannel';
import getLanguagesFromTrChannels from './getLanguagesFromTrChannels';
import buildEmbed from '../../commands/utilities/buildEmbed';
import getUsernameAndAvatarURL from './getUsernameAndAvatarURL';

const handleCommandReplies = async (
  message: Message,
  translateChannels: ITranslateChannel[]
) => {
  if (message.type !== MessageType.ChatInputCommand) return;
  if (!message.interaction) return;
  if (!message.guildId) return;

  const translator = await cache.translator.get(message.guildId);
  if (!translator) return;

  const content = `Used`;
  const enLanguage = codeLanguagesMap.get('en')!;
  const results = await translator.translate({
    content,
    translatorType: 'deepl',
    contentLanguage: enLanguage,
    targetLanguages: getLanguagesFromTrChannels(translateChannels),
  });

  return await Promise.all(
    translateChannels.map(async (trChannel) => {
      if (!trChannel) return;

      const channel = message.client.channels.cache.get(trChannel.id);
      if (!channel) return;
      if (channel.type !== ChannelType.GuildText) return;

      const webhook = await cache.webhook.get(channel);
      const language = codeLanguagesMap.get(trChannel.languageCode);
      if (!language) return;

      const translatedContent = results[language.name];
      if (!translatedContent) return;

      const author = message.interaction!.user;
      const member = message.guild?.members.cache.get(author.id);

      const replyEmbed = buildEmbed(
        member?.nickname ?? message.author.displayName,
        member?.avatarURL({ size: 32 }) ??
          author.displayAvatarURL({ size: 32 }),
        `${translatedContent}: \`/${message.interaction!.commandName}\``
      );

      const [username, avatarURL] = getUsernameAndAvatarURL(message);
      return await webhook.send({
        username,
        avatarURL,
        embeds: [replyEmbed],
      });
    })
  );
};

export default handleCommandReplies;
