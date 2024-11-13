const addReplyPing = (
  content?: string,
  authorId?: string
): string | undefined => {
  // if there's no author id (meaning it's a bot) then don't ping
  if (!authorId) return content;

  // if content is empty
  if (!content) return `<@${authorId}>`;

  // do not add reply ping if there's already a ping on the user
  // INFO: pinging a user will ping the user on all channels, this is intended
  // therefore it's up to people using the bot to tell people not to ping unnecessarily
  if (content.includes(`<@${authorId}>`)) return content;

  return `${content} <@${authorId}>`;
};

export default addReplyPing;
