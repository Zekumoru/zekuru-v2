import { Language, LanguageVariant } from '@zekuru-v2/entities';
import LanguageGroup from './LanguageGroup';
import languagesRepository from '../../../languagesRepository';
import { ApiType } from '@zekuru-v2/types';

const alreadyHasVariant = (
  variants: LanguageVariant[],
  otherCodeVariant: string
) => {
  return variants.some((variant) => variant.code === otherCodeVariant);
};

const refreshCommon = async (
  userId: string,
  apiType: ApiType,
  groupMap: Map<string, LanguageGroup>
) => {
  // get all languages from db to make only one call
  const ids = Array.from(groupMap.keys());
  const languages = await languagesRepository.findByIds(ids);

  const languagesMap = new Map<string, Language>();
  languages.forEach((language) => languagesMap.set(language._id, language));

  await Promise.all(
    [...groupMap.entries()].map(async ([code, group]) => {
      const language = languagesMap.get(code);

      if (!language) {
        await languagesRepository.insertOne({
          _id: code,
          name: group.name,
          createdBy: userId,
          modifiedBy: userId,
          variants: group.variants,
          supports: [apiType],
        });
        return;
      }

      group.variants.forEach((groupVariant) => {
        if (!alreadyHasVariant(language.variants, groupVariant.code)) {
          language.variants.push(groupVariant);
        }
      });

      if (!language.supports.includes(apiType)) {
        language.supports.push(apiType);
      }

      language.modifiedBy = userId;
      await languagesRepository.updateOne(language);
    })
  );
};

export default refreshCommon;
