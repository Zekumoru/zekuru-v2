import 'dotenv/config';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemMessage: ChatCompletionMessageParam = {
  role: 'system',
  content: `Translate to English, Japanese, Chinese, Korean with JSON format {"English":"CONTENT","Japanese":"CONTENT","Chinese":"CONTENT","Korean":"CONTENT"}. Take note of the context of this chat. Don't modify my <:N:> tokens.`,
};

const translate = async (content: string, seed: number) => {
  if (content.trimEnd() === '') return;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [systemMessage, { role: 'user', content: `"""${content}"""` }],
    seed,
  });

  const output = completion.choices[0].message.content;
  if (!output) return {};
  return JSON.parse(output);
};

const testRun = async (messages: string[]) => {
  const seed = 5; // chat session id

  for (const message of messages) {
    const translatedObj = await translate(message, seed);
    console.log({ original: message, translatedObj });
  }
};

testRun([]);
