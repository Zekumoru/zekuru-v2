import { Message } from 'discord.js';

const getUsernameAndAvatarURL = (message: Message) => {
  const username = message.member?.displayName ?? message.author.displayName;
  const avatarURL =
    message.member?.avatarURL() ?? message.author.avatarURL() ?? undefined;

  return [username, avatarURL] as const;
};

export default getUsernameAndAvatarURL;
