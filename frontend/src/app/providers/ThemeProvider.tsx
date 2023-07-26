import { defaultTheme, Provider } from '@adobe/react-spectrum';
import { PropsWithChildren } from 'react';

import { useAppSelector } from '~/common/hooks';
import { selectColorScheme, selectLanguage } from '~/features/settings';

export function ThemeProvider({ children }: PropsWithChildren) {
  const colorScheme = useAppSelector(selectColorScheme);
  const spectrumColorScheme = colorScheme === 'os' ? undefined : colorScheme;
  const language = useAppSelector(selectLanguage);

  return (
    <Provider theme={defaultTheme} locale={language} colorScheme={spectrumColorScheme}>
      {children}
    </Provider>
  );
}
