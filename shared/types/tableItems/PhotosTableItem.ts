import { Exif } from '../Exif';
import { PhotoFingerprint } from '../PhotoFingerprint';

export type PhotosTableItem = Exif & {
  fingerprint: PhotoFingerprint;
  userId: string;
  createdAt: number;
};
