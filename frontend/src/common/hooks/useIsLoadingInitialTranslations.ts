import { useRef } from 'react';
import { useSelector } from 'react-redux';

import { useGetTranslationsQuery } from '~/app/services/publicDirApi';
import { defaultLocale } from '~/common/consts';
import { selectLanguage } from '~/features/settings';

export function useIsLoadingInitialTranslations() {
  const selectedLang = useSelector(selectLanguage);
  const { isLoading } = useGetTranslationsQuery(selectedLang);
  const initialLang = useRef(selectedLang);

  return {
    isLoadingInitialTranslations: isLoading && initialLang.current !== defaultLocale,
  };
}
