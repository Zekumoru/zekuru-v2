import * as deepl from 'deepl-node';

const normalizeDeeplLanguagesToMap = (
  sourceLanguages: readonly deepl.Language[],
  targetLanguages: readonly deepl.Language[]
): Map<string, string> => {
  const map = new Map<string, string | undefined>();

  // 1. Put both source and target languages codes to map
  //    with source already saving its name equivalent
  //    Target languages are first to be added because for
  //    some reason Deepl has zh: Chinese (simplified) and
  //    zh-HANS: Chinese (simplified). Like huh? -.-
  targetLanguages.forEach(({ code }) => map.set(code, undefined));
  sourceLanguages.forEach(({ code, name }) => map.set(code, name));

  // 2. Put target languages to Map
  const targetLanguagesMap = new Map<string, string>();
  targetLanguages.forEach(({ code, name }) =>
    targetLanguagesMap.set(code, name)
  );

  // 3. Put missing names in map from target languages Map
  for (const [key, value] of map.entries()) {
    if (value) continue;
    map.set(key, targetLanguagesMap.get(key));
  }

  return map as Map<string, string>;
};

export default normalizeDeeplLanguagesToMap;
