import { ChannelType, Message, TextChannel } from 'discord.js';
import buildEmojisOnlyMap from './buildEmojisOnlyMap';
import {
  DISCORD_ATTACHMENT_SIZE_LIMIT,
  DISCORD_MESSAGE_CHARS_LIMIT,
} from './limits';
import { TRepliesMap } from './buildRepliesMap';
import tagTranscoder from '../../utilities/tagTranscoder';
import cache from '../../cache';
import getLanguagesFromTrChannels from './getLanguagesFromTrChannels';
import { ITranslateChannel } from '../../db/models/TranslateChannel';
import { Language, codeLanguagesMap } from '../../translation/languages';
import addReplyPing from './addReplyPing';
import getUsernameAndAvatarURL from './getUsernameAndAvatarURL';
import buildTranslationContextContent from '../../translation/context/buildTranslationContextContent';
import { appDebug } from '../../utilities/logger';

const handleMessageTranslation = async (
  message: Message,
  sourceLanguage: Language,
  targetTrChannels: ITranslateChannel[],
  repliesMap: TRepliesMap
) => {
  if (!message.guildId) return;

  const translator = await cache.translator.get(message.guildId);
  if (!translator) return;

  const emojisOnlyMap = buildEmojisOnlyMap(message, targetTrChannels);

  // build warnings strings
  const warningsStrBuilder: string[] = [];
  let results: { [key: string]: string | undefined } = {};

  // translate if not emoji-only
  if (!emojisOnlyMap) {
    // because Discord has 2K characters limit, trim it to 2K
    const userReachedLimit =
      message.content.length > DISCORD_MESSAGE_CHARS_LIMIT;

    if (userReachedLimit) {
      warningsStrBuilder.push(
        `**Warning:** You sent a message over 2000 characters. Due to Discord's characters limit, only the first 2000 characters will be translated.`
      );
    }

    const trimmedContent = userReachedLimit
      ? message.content.slice(0, DISCORD_MESSAGE_CHARS_LIMIT)
      : message.content;

    const [contentToTranslate, tagTable] = tagTranscoder.encode(trimmedContent);

    // REMEMBER: Change this when preferred translator is implemented
    const translatorType = 'openai';

    if (translatorType === 'openai') {
      console.time('onContextBuild');
      const content = await buildTranslationContextContent(
        message,
        getLanguagesFromTrChannels(targetTrChannels)
      );
      console.timeEnd('onContextBuild');
      if (!content) return;
      console.time('onGptTranslate');
      results = await translator.translate({
        translatorType: 'openai',
        content,
      });
      console.timeEnd('onGptTranslate');
    } else {
      results = await translator.translate({
        content: contentToTranslate,
        contentLanguage: sourceLanguage,
        targetLanguages: getLanguagesFromTrChannels(targetTrChannels),
        translatorType: 'deepl',
      });
    }

    Object.keys(results).forEach((key) => {
      const translated = results[key];
      if (!translated) return;
      // REMEMBER: Trim the translated output later since it might have
      //           surpassed Discord's 2K characters limit
      results[key] = tagTranscoder.decode(translated, tagTable);
    });
  }

  return await Promise.all(
    targetTrChannels.map(async (trChannel) => {
      const language = codeLanguagesMap.get(trChannel.languageCode);
      if (!language) return;

      const channel = message.client.channels.cache.get(trChannel.id);
      if (!channel) return;
      if (channel.type !== ChannelType.GuildText) return;

      const webhook = await cache.webhook.get(channel);

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
            `**Warning:** The translated message in <#${trChannel.id}> is over 2000 characters. Due to Discord's characters limit, only the first 2000 characters will be shown.`
          );
        }
      }

      let bigAttachmentCount = 0;
      const attachments = message.attachments
        .map((attachment) => attachment)
        .filter((attachment) => {
          if (attachment.size > DISCORD_ATTACHMENT_SIZE_LIMIT) {
            bigAttachmentCount++;
            return false; // don't include it for sending to other translate channels
          }
          return true;
        });

      const reply = repliesMap.get(trChannel.id);
      const [username, avatarURL] = getUsernameAndAvatarURL(message);
      const webhookMessage =
        translatedContent || attachments.length || reply
          ? await webhook.send({
              username,
              avatarURL,
              content: addReplyPing(translatedContent, reply?.authorId),
              files: attachments,
              embeds: reply ? [reply.embed] : undefined,
            })
          : undefined;

      // notify user if they sent a an attachment over 25 MB
      if (bigAttachmentCount) {
        warningsStrBuilder.push(
          `**Warning:** You sent ${
            bigAttachmentCount === 1 ? `an attachment` : `attachments`
          } over 25MB (in <#${
            message.channelId
          }>). Due to Discord's attachment size limit, ${
            bigAttachmentCount === 1 ? `it` : `they`
          } won't be sent to other translate channels.`
        );
      }

      // Send warnings
      if (warningsStrBuilder.length) {
        await message.reply({
          content: warningsStrBuilder.join('\n'),
        });
      }

      return webhookMessage;
    })
  );
};

export default handleMessageTranslation;
