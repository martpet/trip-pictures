export type Exif = {
  dateOriginal: string;
  lon: number;
  lat: number;
  altitude?: number;
  destBearing?: number;
  hPositioningError?: number;
  speed?: number;
  make?: string;
  model?: string;
  lensModel?: string;
};
