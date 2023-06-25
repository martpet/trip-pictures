import { PresignedPost } from '@aws-sdk/s3-presigned-post';
import { createSlice, isAnyOf, PayloadAction } from '@reduxjs/toolkit';

import { startAppListening } from '~/app/store/middleware';
import { RootState } from '~/common/types';
import { createPhotos } from '~/features/photos';
import {
  addFiles,
  createUploadUrls,
  FileMeta,
  removeFile,
  selectFiles,
  selectFilesPendingCreation,
  selectFilesPendingTransfer,
  transferFiles,
} from '~/features/upload';

type FileId = FileMeta['id'];

export type UploadState = {
  flowStatus: 'idle' | 'pending' | 'transferring' | 'creatingItems' | 'done' | 'error';
  files: FileMeta[];
  isAddingFiles: boolean;
  presignedPosts: Record<FileId, PresignedPost>;
  transfersProgress: Record<FileId, number>;
  fingerprintsInDb: FileId[];
  successfulTransfers: FileId[];
  failedTransfers: FileId[];
  completedUploads: FileId[];
  pendingFileRemovals: FileId[];
};

const initialState: UploadState = {
  flowStatus: 'idle',
  files: [],
  isAddingFiles: false,
  presignedPosts: {},
  fingerprintsInDb: [],
  transfersProgress: {},
  successfulTransfers: [],
  failedTransfers: [],
  completedUploads: [],
  pendingFileRemovals: [],
};

export const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    uploadStarted(state) {
      state.flowStatus = 'pending';
      state.failedTransfers = [];
      state.transfersProgress = Object.fromEntries(
        state.successfulTransfers.map((id) => [id, 100])
      );
    },
    transfersProgressUpdated(state, { payload }: PayloadAction<Record<string, number>>) {
      Object.assign(state.transfersProgress, payload);
    },
    transferCompleted(state, { payload }: PayloadAction<string>) {
      state.successfulTransfers.push(payload);
      state.transfersProgress[payload] = 100;
    },
    transferFailed(state, { payload }: PayloadAction<string>) {
      state.failedTransfers.push(payload);
    },
    userIsDone() {
      return initialState;
    },
  },
  extraReducers({ addCase, addMatcher }) {
    addCase(addFiles.pending, (state) => {
      state.isAddingFiles = true;
    });
    addCase(addFiles.fulfilled, (state, { payload }) => {
      state.isAddingFiles = false;
      state.files = state.files.concat(payload);
    });
    addCase(removeFile.pending, (state, { meta }) => {
      state.pendingFileRemovals.push(meta.arg);
    });
    addCase(removeFile.fulfilled, (state, { payload }) => {
      state.files = state.files.filter(({ id }) => id !== payload);
      state.pendingFileRemovals = state.pendingFileRemovals.filter(
        (id) => id !== payload
      );
      if (!state.files.length) state.flowStatus = 'idle';
    });
    addCase(transferFiles.pending, (state) => {
      state.flowStatus = 'transferring';
    });
    addCase(transferFiles.fulfilled, (state) => {
      const filesPendingCreation = selectFilesPendingCreation({
        upload: state,
      } as RootState);

      if (state.files.length && !filesPendingCreation.length) {
        state.flowStatus = 'done';
      }
    });
    addMatcher(createUploadUrls.matchFulfilled, (state, { payload }) => {
      state.presignedPosts = payload.presignedPosts;
      if (!Object.keys(state.presignedPosts).length) {
        state.flowStatus = 'done';
      }
      state.fingerprintsInDb = state.fingerprintsInDb.concat(
        payload.existingFingerprintsInDb
      );
    });
    addMatcher(createPhotos.matchPending, (state) => {
      state.flowStatus = 'creatingItems';
    });
    addMatcher(createPhotos.matchFulfilled, (state, { meta }) => {
      const fingerprints = meta.arg.originalArgs.map(({ fingerprint }) => fingerprint);
      state.fingerprintsInDb = state.fingerprintsInDb.concat(fingerprints);
      state.completedUploads = state.successfulTransfers;
      state.flowStatus = 'done';
    });
    addMatcher(
      isAnyOf(
        createUploadUrls.matchRejected,
        transferFiles.rejected,
        createPhotos.matchRejected
      ),
      (state, { meta: { aborted } }) => {
        state.flowStatus = aborted ? 'idle' : 'error';
      }
    );
  },
});

export const {
  uploadStarted,
  transfersProgressUpdated,
  transferCompleted,
  transferFailed,
  userIsDone,
} = uploadSlice.actions;

// Listeners

startAppListening({
  actionCreator: uploadStarted,
  effect(_, { dispatch, getState }) {
    const filesPendingTransfer = selectFilesPendingTransfer(getState());
    const filesPendingCreation = selectFilesPendingCreation(getState());
    if (filesPendingTransfer.length) {
      dispatch(createUploadUrls.initiate(filesPendingTransfer, { track: false }));
    } else if (filesPendingCreation.length) {
      dispatch(createPhotos.initiate(filesPendingCreation, { track: false }));
    }
  },
});

startAppListening({
  matcher: createUploadUrls.matchFulfilled,
  effect(_, { dispatch, getState }) {
    const filesPendingTransfer = selectFilesPendingTransfer(getState());
    if (filesPendingTransfer.length) {
      dispatch(transferFiles());
    }
  },
});

startAppListening({
  actionCreator: transferFiles.fulfilled,
  effect(_, { dispatch, getState }) {
    const filesPendingCreation = selectFilesPendingCreation(getState());
    if (filesPendingCreation.length) {
      dispatch(createPhotos.initiate(filesPendingCreation, { track: false }));
    }
  },
});

startAppListening({
  actionCreator: userIsDone,
  effect(_, { getState }) {
    const files = selectFiles(getState());
    files.forEach(({ objectURL }) => {
      URL.revokeObjectURL(objectURL);
    });
  },
});

startAppListening({
  actionCreator: removeFile.fulfilled,
  effect(action, { getOriginalState }) {
    const originalFiles = selectFiles(getOriginalState());
    const removedFile = originalFiles.find(({ id }) => id === action.payload);
    if (removedFile) {
      URL.revokeObjectURL(removedFile.objectURL);
    }
  },
});
