import { View } from '@adobe/react-spectrum';
import { CSSProperties, useLayoutEffect, useRef, useState } from 'react';

import { Spinner } from '~/common/components/Spinner';
import { apiUrl } from '~/common/utils';

type Props = {
  fingerprint: string;
  width?: number;
  height?: number;
  noLoader?: boolean;
  aspectRatio?: string;
  style?: CSSProperties;
  onLoad?: () => void;
  colsCount: number;
};

export function UploadedImage({
  fingerprint,
  width,
  height,
  style,
  noLoader,
  onLoad,
  colsCount,
}: Props) {
  const [isLoaderVisible, setIsLoaderVisible] = useState(false);
  const timeoutRef = useRef<number>();

  const imageUrl = apiUrl('/images/:fingerprint', {
    pathParams: { fingerprint },
    searchParams: {
      ...(width && { width: width?.toString() }),
      ...(height && { height: height?.toString() }),
    },
  });

  useLayoutEffect(() => {
    timeoutRef.current = window.setTimeout(() => {
      setIsLoaderVisible(true);
    }, 100);

    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleLoad = () => {
    setIsLoaderVisible(false);
    clearTimeout(timeoutRef.current);
    if (onLoad) onLoad();
  };

  return (
    <View
      position="relative"
      borderRadius={colsCount === 1 ? undefined : undefined}
      overflow="hidden"
      height="100%"
      UNSAFE_style={{ aspectRatio: `${colsCount > 1 ? '1 / 1' : 'auto'}`, ...style }}
    >
      <Spinner
        isHidden={noLoader || !isLoaderVisible}
        size="S"
        position="absolute"
        left="50%"
        top="50%"
        UNSAFE_style={{ transform: 'translate(-50%, -50%)' }}
      />

      <img
        alt=""
        src={imageUrl}
        onLoad={handleLoad}
        onError={handleLoad}
        style={{
          position: 'relative',
          display: 'block',
          gridColumn: '1',
          gridRow: '1',
          width: '100%',
          height: '100%',
          border: 'none',
          objectFit: `${colsCount > 1 ? 'cover' : 'contain'}`,
        }}
      />
    </View>
  );
}
