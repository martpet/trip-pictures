import { useEffect, useState } from 'react';
import { MapRef, useMap } from 'react-map-gl';

import { useMapStyle } from '~/features/map';

type Props = {
  map?: MapRef;
  images: Array<{
    name: string;
    path: string;
    width: number;
    height: number;
    stretchX?: [number, number][];
    content?: [number, number, number, number];
  }>;
};

export function useMapImages({ images }: Props) {
  const { current: map } = useMap();
  const [isLoaded, setIsLoaded] = useState(false);
  const mapStyle = useMapStyle();

  useEffect(() => {
    if (!map || !mapStyle) {
      return;
    }

    (async () => {
      setIsLoaded(false);
      await addImages(images, map);
      setIsLoaded(true);
    })();
  }, [map, mapStyle]);

  return isLoaded;
}

async function addImages(images: Props['images'], map: MapRef) {
  return Promise.all(
    images.map(async ({ name, path, width, height, stretchX, content }) => {
      const img = new Image(width, height);
      img.src = path;

      await new Promise<void>((resolve) => {
        img.onload = () => {
          if (!map.hasImage(name)) {
            map.addImage(name, img, {
              sdf: true,
              stretchX,
              content,
            });
          }
          resolve();
        };
      });
    })
  );
}
