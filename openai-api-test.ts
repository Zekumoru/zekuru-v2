import 'dotenv/config';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';

interface IReply {
  username: string;
  content: string;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const seed = 12;

const createUserMessage = (
  user: string,
  content: string,
  languages: string[],
  reply?: IReply
): ChatCompletionMessageParam => {
  const langStrBuilder: string[] = [];
  languages.forEach((language, i) => {
    langStrBuilder.push(language);
    if (language.length <= 1) return;
    if (i + 2 < languages.length) langStrBuilder.push(', ');
    if (i + 2 === languages.length) langStrBuilder.push(', and ');
  });

  return {
    role: 'user',
    content: `User: ${user}\n${
      reply
        ? `Replying to user: ${reply.username}\nReplying to message:\n${reply.content}\n`
        : ``
    }Translate to JSON format in ${langStrBuilder.join(
      ''
    )}.\nMessage:\n${content}`,
  };
};

interface ITranslationMessage {
  language: string;
  content: string;
}

const createTranslatedMessage = (
  translations: ITranslationMessage[]
): ChatCompletionMessageParam => {
  const data: { [key: string]: string } = {};
  translations.forEach(
    (translation) => (data[translation.language] = translation.content)
  );
  return {
    role: 'system',
    content: JSON.stringify(data),
  };
};

const buildTrainingMessages = () => {
  const messages: ChatCompletionMessageParam[] = [];

  messages.push({
    role: 'system',
    content: `You're a seamless translator which translates multiple different channels across a Discord server. Your job is to take note of context of the chat and translate users' messages in JSON format in the form {"Language 1":"Content","Language 2":"Content",...,"Language N":"Content"}. Do not translate tags in the form <:N:> where N is a number.`,
  });

  messages.push(
    createUserMessage('zekumoru', 'Hello!', [
      'English',
      'Japanese',
      'Chinese',
      'Korean',
    ])
  );
  messages.push(
    createTranslatedMessage([
      {
        language: 'English',
        content: `Hello!`,
      },
      {
        language: 'Japanese',
        content: `こんにちは！`,
      },
      {
        language: 'Chinese',
        content: `你好!`,
      },
      {
        language: 'Korean',
        content: `안녕하세요!`,
      },
    ])
  );
  messages.push(
    createUserMessage(
      'zekumoru',
      '元気です',
      ['English', 'Japanese', 'Chinese', 'Korean'],
      {
        username: 'pikasonic',
        content: '元気ですか',
      }
    )
  );
  messages.push(
    createTranslatedMessage([
      {
        language: 'English',
        content: `I'm fine.`,
      },
      {
        language: 'Japanese',
        content: `元気です`,
      },
      {
        language: 'Chinese',
        content: `我没事`,
      },
      {
        language: 'Korean',
        content: `건강합니다`,
      },
    ])
  );
  messages.push(
    createUserMessage('zekumoru', '<:0:>', [
      'English',
      'Japanese',
      'Chinese',
      'Korean',
    ])
  );
  messages.push(
    createTranslatedMessage([
      {
        language: 'English',
        content: `<:0:>`,
      },
      {
        language: 'Japanese',
        content: `<:0:>`,
      },
      {
        language: 'Chinese',
        content: `<:0:>`,
      },
      {
        language: 'Korean',
        content: `<:0:>`,
      },
    ])
  );
  messages.push(
    createUserMessage('zekumoru', '?', [
      'English',
      'Japanese',
      'Chinese',
      'Korean',
    ])
  );
  messages.push(
    createTranslatedMessage([
      {
        language: 'English',
        content: `?`,
      },
      {
        language: 'Japanese',
        content: `?`,
      },
      {
        language: 'Chinese',
        content: `?`,
      },
      {
        language: 'Korean',
        content: `?`,
      },
    ])
  );

  return messages;
};

const translate = async ({
  username,
  content,
  languages,
  seed,
  reply,
}: {
  username: string;
  content: string;
  languages: string[];
  seed: number;
  reply?: IReply;
}) => {
  if (content.trimEnd() === '') return;

  const messages: ChatCompletionMessageParam[] = [];
  messages.push(...buildTrainingMessages());
  messages.push(createUserMessage(username, content, languages, reply));

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    temperature: 0.7,
    messages,
    seed,
  });

  const output = completion.choices[0].message.content;
  if (!output) return {};
  console.log(completion.usage);
  return JSON.parse(output);
};

// const testRun = async (
//   messages: {
//     username: string;
//     content: string;
//     reply?: IReply;
//   }[],
//   languages: string[]
// ) => {
//   for (const { username, content, reply } of messages) {
//     const translatedObj = await translate({
//       username,
//       content,
//       languages,
//       reply,
//       seed,
//     });
//     console.log({ original: content, translatedObj });
//   }
// };

(async () => {
  const output = await translate({
    username: 'zekumoru',
    content: 'ありがとう！',
    languages: ['English', 'Italian', 'Tagalog'],
    seed: 1,
  });
  console.log(output);
})();

// testRun(
//   [
//     {
//       username: 'shewi.',
//       content: 'zeku is god of Typescript',
//     },
//     {
//       username: 'shewi.',
//       content: '<:0:>',
//     },
//     {
//       username: 'shewi.',
//       content: 'and c',
//     },
//     {
//       username: 'frzhrzn',
//       content: '<:0:>',
//     },
//     {
//       username: 'falselapfer',
//       content: 'Wow',
//       reply: {
//         username: 'zekumoru',
//         content: '<:0:>',
//       },
//     },
//     {
//       username: 'falselapfer',
//       content: 'すげえ',
//     },
//     {
//       username: 'shirukamiarius',
//       content: '<:0:>',
//     },
//     {
//       username: 'zekumoru',
//       content: 'Xin chào máy chủ của Pikasonic! ^^',
//     },
//     {
//       username: 'shewi.',
//       content: 'TEAPOT',
//     },
//     {
//       username: 'shewi.',
//       content: '<:0:> <:0:> <:0:>',
//     },
//     {
//       username: 'shewi.',
//       content: '<:0:>',
//     },
//     {
//       username: 'pikasonic',
//       content:
//         'Usage count: **21,750 / 500,000 characters**; Remaining: **478,250 characters**.',
//     },
//     {
//       username: 'alka_loid',
//       content: '?',
//     },
//     {
//       username: 'shewi.',
//       content: 'A',
//       reply: {
//         username: 'zekumoru',
//         content: `I'm copying and pasting your messages ahahaha, I don't store them in database. <:0:>`,
//       },
//     },
//     {
//       username: 'machamacha_no_macha',
//       content: 'それな',
//       reply: {
//         username: 'falselapfer',
//         content: 'すげえ',
//       },
//     },
//     {
//       username: 'machamacha_no_macha',
//       content: 'はにゃ？',
//     },
//     {
//       username: 'falselapfer',
//       content: '？',
//     },
//     {
//       username: 'falselapfer',
//       content: '何も言ってないよ',
//     },
//     {
//       username: 'falselapfer',
//       content: 'あ、すげえを英訳したらそうなるんだ',
//     },
//     {
//       username: 'falselapfer',
//       content: 'それなの英訳がおかしいのか',
//     },
//   ],
//   ['English', 'Japanese', 'Chinese', 'Korean']
// );
