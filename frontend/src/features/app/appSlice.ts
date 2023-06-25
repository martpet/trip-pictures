import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '~/common/types';

// Slice
export type AppState = {
  loaders: number;
  browserLocale: string;
  isUploadDialogOpen: boolean;
  breadcrumbs: string[];
};

const initialState: AppState = {
  loaders: 0,
  browserLocale: window.navigator.language,
  isUploadDialogOpen: false,
  breadcrumbs: [],
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    loaderAdded(state) {
      state.loaders++;
    },
    loaderRemoved(state) {
      state.loaders--;
    },
    browserLocaleChanged(state) {
      state.browserLocale = window.navigator.language;
    },
    uploadDialogToggled(state, { payload }: PayloadAction<boolean>) {
      state.isUploadDialogOpen = payload;
    },
    locationChanged(state, { payload }: PayloadAction<string>) {
      const prev = state.breadcrumbs.at(-2);
      if (payload === prev) {
        state.breadcrumbs.pop();
      } else {
        state.breadcrumbs.push(payload);
      }
    },
  },
  // extraReducers(builder) {
  //   trackLoaders<AppState>(builder, []);
  // },
});

export const {
  loaderAdded,
  loaderRemoved,
  browserLocaleChanged,
  uploadDialogToggled,
  locationChanged,
} = appSlice.actions;

// Selectors
export const selectHasAppLoaders = (state: RootState) => state.app.loaders > 0;

export const selectUploadDialogOpened = (state: RootState) =>
  state.app.isUploadDialogOpen;

export const selectBreadrumbs = (state: RootState) => state.app.breadcrumbs;
