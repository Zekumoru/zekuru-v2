import LanguageGroup from './LanguageGroup';

const createGroupMap = (
  map: Map<string, string>
): Map<string, LanguageGroup> => {
  const groupMap = new Map<string, LanguageGroup>();

  for (const [key, value] of map.entries()) {
    const index = key.indexOf('-');
    const code = key.substring(0, index === -1 ? key.length : index);

    if (!groupMap.has(code)) {
      groupMap.set(code, {
        name: undefined as unknown as string, // fake it since we don't know if this is a variant
        code,
        variants: [],
      });
    }

    const group = groupMap.get(code) as LanguageGroup;
    const name = value;

    if (index < 0) {
      group.name = name;
    }

    group.variants.push({ code: key, name });
  }

  return groupMap;
};

export default createGroupMap;
