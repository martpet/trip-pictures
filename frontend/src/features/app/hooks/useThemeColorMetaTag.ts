import { useProvider } from '@adobe/react-spectrum';
import { useLayoutEffect } from 'react';

export const SPECTRUM_DARK = 'rgb(29, 29, 29)';
export const SPECTRUM_LIGHT = 'rgb(248, 248, 248)';

export const useThemeColorMetaTag = () => {
  const { colorScheme } = useProvider();
  const metaEl = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;

  useLayoutEffect(() => {
    if (metaEl) {
      metaEl.content = colorScheme === 'dark' ? SPECTRUM_DARK : SPECTRUM_LIGHT;
    }
  }, [colorScheme]);
};
