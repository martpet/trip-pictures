export const mapProviders = ['esri', 'here'] as const;

export type MapProvider = (typeof mapProviders)[number];

export type MapOptions = {
  mapName: string;
  mapProvider: MapProvider;
  style: string;
};
