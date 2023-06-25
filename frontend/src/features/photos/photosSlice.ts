import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '~/common/types';

export type PhotosState = {
  galleryColsCount: number;
};

const initialState: PhotosState = {
  galleryColsCount: 10,
};

export const photosSlice = createSlice({
  name: 'photos',
  initialState,
  reducers: {
    galleryColsCountChanged(state, { payload }: PayloadAction<number>) {
      state.galleryColsCount = payload;
    },
  },
});

// Actions
export const { galleryColsCountChanged } = photosSlice.actions;

// Selectors
export function selectGalleryColsCount(state: RootState) {
  return state.photos.galleryColsCount;
}

// Listeners
