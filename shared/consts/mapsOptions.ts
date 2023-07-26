import { MapOptions, MapProvider, mapProviders } from '../types';
import { appName } from './sharedConsts';

const styles: Record<`${MapProvider}${string}`, string> = {
  esriLightGray: 'VectorEsriLightGrayCanvas',
  esriDarkGray: 'VectorEsriDarkGrayCanvas',
  hereExplore: 'VectorHereExplore',
};

export const mapsOptions = Object.fromEntries(
  Object.entries(styles).map(([key, style]) => [
    key,
    {
      mapName: `${appName}-${style}`,
      style,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      mapProvider: mapProviders.find((provider) => key.includes(provider))!,
    } satisfies MapOptions,
  ])
);
