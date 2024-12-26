import { Language, LanguageVariant } from '@zekuru-v2/entities';
import LanguageGroup from './LanguageGroup';
import languagesRepository from '../../../languagesRepository';

const alreadyHasVariant = (
  variants: LanguageVariant[],
  otherCodeVariant: string
) => {
  return variants.some((variant) => variant.code === otherCodeVariant);
};

const refreshDeeplLanguages = async (
  groupMap: Map<string, LanguageGroup>,
  userId: string
) => {
  // get all languages from db to make only one call
  const ids = Array.from(groupMap.keys());
  const languages = await languagesRepository.findByIds(ids);

  const languagesMap = new Map<string, Language>();
  languages.forEach((language) => languagesMap.set(language._id, language));

  for (const [code, group] of groupMap) {
    const language = languagesMap.get(code);

    if (!language) {
      await languagesRepository.insertOne({
        _id: code,
        name: group.name,
        createdBy: userId,
        modifiedBy: userId,
        variants: group.variants,
        supports: ['deepl'],
      });
      continue;
    }

    group.variants.forEach((groupVariant) => {
      if (!alreadyHasVariant(language.variants, groupVariant.code)) {
        language.variants.push(groupVariant);
      }
    });

    if (!language.supports.includes('deepl')) {
      language.supports.push('deepl');
    }

    language.modifiedBy = userId;
    await languagesRepository.updateOne(language);
  }
};

export default refreshDeeplLanguages;
