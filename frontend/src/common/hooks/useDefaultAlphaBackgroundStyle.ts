import { useProvider } from '@adobe/react-spectrum';
import { CSSProperties } from 'react';

export function useDefaultAlphaBackgroundStyle(): CSSProperties {
  const { colorScheme } = useProvider();

  const DARK_ALPHA = 'rgba(29,29,29,0.9)';
  const LIGHT_ALPHA = 'rgba(248,248,248,0.8)';

  return {
    background: colorScheme === 'dark' ? DARK_ALPHA : LIGHT_ALPHA,
    backdropFilter: 'saturate(180%) blur(20px)',
    WebkitBackdropFilter: 'saturate(180%) blur(20px)',
  };
}
