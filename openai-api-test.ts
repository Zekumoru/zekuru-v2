import 'dotenv/config';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';
import fs from 'fs/promises';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const promptTest = async (seed: number) => {
  const prompt = await fs.readFile('./samples/prompt-2d.txt', 'utf8');
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    seed,
    messages: [
      {
        role: 'system',
        content: `Translate users' messages in JSON format in the form {"Language 1":"Content","Language 2":"Content",...,"Language N":"Content"}. Do not translate tags of <:N:>.`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const output = completion.choices[0].message.content;
  if (!output) return {};
  console.log(completion.usage);

  const parsed = JSON.parse(output);
  console.log(parsed);
  return parsed;
};

(async () => {
  for (let i = 0; i < 10; i++) {
    const seed = Math.floor(Math.random() * 1_000_000_000);
    console.log({ seed });
    await promptTest(seed);
    // wait 1 second
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
})();
