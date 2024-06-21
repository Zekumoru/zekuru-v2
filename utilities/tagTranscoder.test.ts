import tagTranscoder from './tagTranscoder';

describe('tagTranscoder', () => {
  test.each([
    [`this is an example sentence`],
    [`<@123> did you check the <#456> channel`],
    [`<:emoji:111> <:emoji:111> <:emoji:111>`],
    [`Yes sure! <:emoji:111> <a:emoji_anim:222>`],
    [`Why don't you check the official docs here: https://discord.js.org/ ?`],
    [
      `
Check the code below:
\`\`\`ts
// some code...
\`\`\`

Or you can also try:
\`\`\`ts
// some code...
\`\`\`

Hopefully that answers your question! <a:emoji_anim:333>
`,
    ],
    [`Some <@123> random <#456> text <@789>`],
  ])(`%s - that encoding/decoding works`, (text) => {
    const [encoded, tagTable] = tagTranscoder.encode(text);

    expect(encoded).toMatchSnapshot();
    expect(tagTranscoder.decode(encoded, tagTable)).toBe(text);
  });
});
