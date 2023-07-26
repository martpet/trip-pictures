import { createAsyncThunk } from '@reduxjs/toolkit';

import { createPhotoFingerprint, removeDateStringOffset } from '~/common/utils';
import { FileMeta, getExif, hashFile } from '~/features/upload';

export const addFiles = createAsyncThunk<FileMeta[], FileList>(
  'upload/addFilesStatus',
  (fileList) =>
    Promise.all(
      Array.from(fileList).map(async (file) => {
        const exif = await getExif(file);
        const date = removeDateStringOffset(exif.dateOriginal || '');
        const { lon, lat } = exif;
        const fingerprint = createPhotoFingerprint({ date, lon, lat });

        return {
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          exif,
          fingerprint,
          digest: await hashFile(file),
          objectURL: URL.createObjectURL(file),
        };
      })
    )
);
