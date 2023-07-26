import { createAction, createSlice, isAnyOf } from '@reduxjs/toolkit';
import { RequireAtLeastOne } from 'type-fest';

import { startAppListening } from '~/app/store/middleware';
import { defaultLocale, languages } from '~/common/consts';
import {
  ColorScheme,
  Language,
  RootState,
  SyncedSettings,
  SyncedSettingsKey,
} from '~/common/types';
import { getMe, selectIsLoggedIn } from '~/features/me';
import { getSettingsToSync, updateSettings } from '~/features/settings';

// Actions

export const settingsChanged = createAction<RequireAtLeastOne<SyncedSettings>>(
  'settings/changedByUser'
);

export const gotNewSettingsFromRemote = createAction<RequireAtLeastOne<SyncedSettings>>(
  'settings/changedFromDb'
);

// Slice

export type SettingsState = {
  synced: SyncedSettings;
};

const initialState: SettingsState = {
  synced: <Record<SyncedSettingsKey, undefined>>{},
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addMatcher(
      isAnyOf(settingsChanged, gotNewSettingsFromRemote),
      (state, action) => {
        Object.assign(state.synced, action.payload);
      }
    );
  },
});

// Selectors

const selectSettings = (state: RootState) => state.settings.synced;

export const selectSettingsDialogActiveTab = (state: RootState) =>
  state.settings.synced.settingsDialogTab;

export const selectLanguage = (state: RootState): Language => {
  const { language } = state.settings.synced;
  if (language) return language;
  const browserLanguage = state.app.browserLocale.split('-')[0] as Language;
  return languages.includes(browserLanguage) ? browserLanguage : defaultLocale;
};

export const selectColorScheme = (state: RootState): ColorScheme =>
  state.settings.synced.colorScheme || 'os';

export const selectIsToolbarTranslucent = (state: RootState) =>
  state.settings.synced.isToolbarTranslucent;

export const selectIsPointPreviewModeOn = (state: RootState) =>
  state.settings.synced.isPointPreviewModeOn ?? true;

export const selectIsPointPreviewHoverEffectOn = (state: RootState) =>
  state.settings.synced.isPointPreviewHoverEffectOn ?? true;

// Listeners

startAppListening({
  actionCreator: settingsChanged,
  effect({ payload }, { dispatch, getState }) {
    const isLoggedIn = selectIsLoggedIn(getState());
    if (isLoggedIn) {
      dispatch(updateSettings.initiate(payload));
    }
  },
});

startAppListening({
  matcher: getMe.matchFulfilled,
  effect({ payload }, { dispatch, getState }) {
    const { localPatch, remotePatch } = getSettingsToSync({
      localSettings: selectSettings(getState()),
      remoteSettings: payload.settings,
    });
    if (localPatch) {
      dispatch(gotNewSettingsFromRemote(localPatch));
    }
    if (remotePatch) {
      dispatch(updateSettings.initiate(remotePatch));
    }
  },
});
