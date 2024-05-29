import { ChannelType, Message, PartialMessage } from 'discord.js';
import MessageLink from '../../db/models/MessageLink';
import cache from '../../cache';
import getMessagesFromMessageLink from '../../commands/utilities/getMessagesFromMessageLink';
import { errorDebug } from '../../utilities/logger';
import { DISCORD_MESSAGE_CHARS_LIMIT } from '../translation/limits';
import { codeLanguagesMap } from '../../translation/languages';
import buildEmojisOnlyMap from '../translation/buildEmojisOnlyMap';
import { ITranslateChannel } from '../../db/models/TranslateChannel';
import getLanguagesFromTrChannels from '../translation/getLanguagesFromTrChannels';
import tagTranscoder from '../../utilities/tagTranscoder';

const updateTranslateMessages = async (
  newMessage: Message<boolean> | PartialMessage
) => {
  if (!newMessage.guild) return;
  if (!newMessage.content) return;

  // get message link
  const link = await MessageLink.findOne({ messageId: newMessage.id });
  if (!link) return;

  // check if the edited message's translate channel exists
  const sourceTrChannel = await cache.translateChannel.get(
    newMessage.channelId
  );
  if (!sourceTrChannel) return;

  const translator = await cache.translator.get(newMessage.guild.id);
  if (!translator) return;

  const sourceLanguage = codeLanguagesMap.get(sourceTrChannel.languageCode);
  if (!sourceLanguage) return;

  // get other channels' linked messages
  const messages = (
    await getMessagesFromMessageLink(link, newMessage.id, newMessage.guild)
  )?.filter((message) => {
    // make sure it's sent by the webhook using webhookId
    return (
      message &&
      message.webhookId &&
      message.channel.type === ChannelType.GuildText
    );
  }) as Message[] | undefined;
  if (!messages) return;

  const targetTrChannels = (
    await Promise.all(
      messages.map((message) => {
        return cache.translateChannel.get(message.channelId);
      })
    )
  ).filter(Boolean) as ITranslateChannel[];

  const emojisOnlyMap = buildEmojisOnlyMap(newMessage, targetTrChannels);

  // build warnings strings
  const warningsStrBuilder: string[] = [];
  let results: { [key: string]: string | undefined } = {};

  // translate if not emoji-only
  if (!emojisOnlyMap) {
    // because Discord has 2K characters limit, trim it to 2K
    const userReachedLimit =
      newMessage.content.length > DISCORD_MESSAGE_CHARS_LIMIT;

    if (userReachedLimit) {
      warningsStrBuilder.push(
        `**Warning:** You edited a message over 2000 characters. Due to Discord's characters limit, only the first 2000 characters will be translated.`
      );
    }

    const trimmedContent = userReachedLimit
      ? newMessage.content.slice(0, DISCORD_MESSAGE_CHARS_LIMIT)
      : newMessage.content;

    const [contentToTranslate, tagTable] = tagTranscoder.encode(trimmedContent);

    results = await translator.translate({
      content: contentToTranslate,
      contentLanguage: sourceLanguage,
      targetLanguages: getLanguagesFromTrChannels(targetTrChannels),
      translatorType: 'deepl',
    });

    Object.keys(results).forEach((key) => {
      const translated = results[key];
      if (!translated) return;
      // REMEMBER: Trim the translated output later since it might have
      //           surpassed Discord's 2K characters limit
      results[key] = tagTranscoder.decode(translated, tagTable);
    });
  }

  await Promise.all(
    messages.map(async (message) => {
      try {
        const trChannel = await cache.translateChannel.get(message.channelId);
        if (!trChannel) return;

        const language = codeLanguagesMap.get(trChannel.languageCode);
        if (!language) return;

        const channel = newMessage.client.channels.cache.get(trChannel.id);
        if (!channel) return;
        if (channel.type !== ChannelType.GuildText) return;

        const webhook = await cache.webhook.get(channel);

        // edit old message
        let translatedContent: string | undefined;
        if (emojisOnlyMap) {
          // content is an emoji
          translatedContent = emojisOnlyMap.get(trChannel.id);
        } else {
          const result = results[language.name];
          const botReachedLimit =
            !!result && result.length > DISCORD_MESSAGE_CHARS_LIMIT;

          translatedContent = botReachedLimit
            ? result.slice(0, DISCORD_MESSAGE_CHARS_LIMIT)
            : result;

          // notify user if the bot's translated message is over 2K
          if (botReachedLimit) {
            warningsStrBuilder.push(
              `**Warning:** The translated edited message in <#${trChannel.id}> is over 2000 characters. Due to Discord's characters limit, only the first 2000 characters will be shown.`
            );
          }
        }

        await webhook.editMessage(message.id, {
          content: translatedContent,
        });

        // Send warnings
        if (warningsStrBuilder.length) {
          await newMessage.reply({
            content: warningsStrBuilder.join('\n'),
          });
        }
      } catch (error) {
        errorDebug(error);
      }
    })
  );
};

export default updateTranslateMessages;
