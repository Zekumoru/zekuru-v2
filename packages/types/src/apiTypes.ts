export const apiTypes = ['deepl', 'openai', 'gemini'] as const;

export type ApiType = (typeof apiTypes)[number];
