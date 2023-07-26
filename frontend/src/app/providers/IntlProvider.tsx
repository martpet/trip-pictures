import { PropsWithChildren, useEffect, useRef } from 'react';
import { IntlProvider as Provider } from 'react-intl';
import { useSelector } from 'react-redux';

import { useGetTranslationsQuery } from '~/app/services/publicDirApi';
import { defaultLocale } from '~/common/consts';
import { useAppDispatch } from '~/common/hooks';
import { browserLocaleChanged } from '~/features/app';
import { selectLanguage } from '~/features/settings';

export function IntlProvider({ children }: PropsWithChildren) {
  const dispatch = useAppDispatch();
  const selectedLanguage = useSelector(selectLanguage);
  const { data: messages, isFetching } = useGetTranslationsQuery(selectedLanguage);
  const lastLanguageRef = useRef(selectedLanguage);
  const language = isFetching ? lastLanguageRef.current : selectedLanguage;

  useEffect(() => {
    if (!isFetching) {
      lastLanguageRef.current = selectedLanguage;
    }
  }, [isFetching, selectedLanguage]);

  useEffect(() => {
    document.documentElement.lang = selectedLanguage;
  }, [selectedLanguage]);

  useEffect(() => {
    const langChangeListener = () => dispatch(browserLocaleChanged());
    window.addEventListener('languagechange', langChangeListener);
    return () => {
      window.removeEventListener('languagechange', langChangeListener);
    };
  }, []);

  return (
    <Provider
      locale={language}
      defaultLocale={defaultLocale}
      messages={messages || undefined}
      onError={(error) => console.warn(error.message)}
    >
      {children}
    </Provider>
  );
}
