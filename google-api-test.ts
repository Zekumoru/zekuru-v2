import 'dotenv/config';
import { v2 } from '@google-cloud/translate';

const translator = new v2.Translate({
  projectId: process.env.GOOGLE_PROJECT_ID,
  key: process.env.GOOGLE_TRANSLATE_API_KEY,
});

const testRun = async () => {
  const text = `Hello Pikasonic's server! ^^`;
  const target = 'vi';

  const [translation] = await translator.translate(text, target);
  console.log({ text, translation });
};

testRun();
