type TTagTable = Map<string, string>;

interface ITagTranscoder {
  encode: (message: string) => [string, TTagTable];
  decode: (message: string, tagTable: TTagTable) => string;
}

// Ignore syntax: (discord tags | links | code blocks)
const DISCORD_IGNORE_REGEX =
  /(<a?[:@][\w:]*>)|(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&\/=]*))|(```((?!\s)|\r\n|\r|\n|.)*```)/g;

const tagTranscoder: ITagTranscoder = {
  encode: (message) => {
    const matches = message.matchAll(DISCORD_IGNORE_REGEX);
    const tagTable: TTagTable = new Map();
    const tokens: string[] = [];

    let counter = 0;
    let lastIndex = 0;
    for (const match of matches) {
      // push message parts (or tokens)
      const token = message.substring(lastIndex, match.index);
      tokens.push(token);
      lastIndex = match.index + match[0].length;

      // push encoded
      const key = `<:${counter}:>`;
      tokens.push(key);
      tagTable.set(key, match[0]);
      counter++;
    }
    tokens.push(message.substring(lastIndex));

    return [tokens.join(''), tagTable];
  },
  decode: (message, tagTable) => {
    const matches = message.matchAll(DISCORD_IGNORE_REGEX);
    const tokens: string[] = [];

    let lastIndex = 0;
    for (const match of matches) {
      // push message parts (or tokens)
      const token = message.substring(lastIndex, match.index);
      tokens.push(token);
      lastIndex = match.index + match[0].length;

      // push decoded
      const key = match[0];
      tokens.push(tagTable.get(key) ?? '');
    }
    tokens.push(message.substring(lastIndex));

    return tokens.join('');
  },
};

export default tagTranscoder;
