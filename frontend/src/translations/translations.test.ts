import { defaultLocale, languages } from '~/common/consts';
import { Language } from '~/common/types';

const getIds = async (language: Language) => {
  const { default: messages } = await import(`./${language}.json`);
  return Object.keys(messages).sort();
};

const defaultLangIds = await getIds(defaultLocale);

const languagesToTest = languages.filter((lang) => lang !== defaultLocale);

describe('Translations', () => {
  test.each(languagesToTest)('Language `%s` has correct ids', async (language) => {
    const ids = await getIds(language);
    expect(ids).toEqual(defaultLangIds);
  });
});
