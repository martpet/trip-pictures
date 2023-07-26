import { PhotoFingerprint } from '../types';

export function parsePhotoFingerprint(fingerprint: PhotoFingerprint) {
  const [date, lon, lat] = fingerprint.split('_');

  return {
    date,
    lon: Number(lon),
    lat: Number(lat),
  };
}
