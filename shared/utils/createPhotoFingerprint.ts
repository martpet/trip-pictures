import { PhotoFingerprint } from '../types';

export function createPhotoFingerprint({
  date,
  lon,
  lat,
}: {
  date: string;
  lon?: number;
  lat?: number;
}): PhotoFingerprint {
  return `${date}_${Number(lon)}_${Number(lat)}`;
}
