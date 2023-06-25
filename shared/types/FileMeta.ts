import { Exif } from './Exif';
import { PhotoFingerprint } from './PhotoFingerprint';

export type FileMeta = {
  id: string;
  name: string;
  size: number;
  fingerprint: PhotoFingerprint;
  digest: string;
  exif: Partial<Exif>;
  objectURL: string;
};

export type UplaodableFileMeta = Omit<FileMeta, 'exif'> & { exif: Exif };
