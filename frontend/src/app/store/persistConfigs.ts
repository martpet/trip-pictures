import { PersistConfig } from 'redux-persist';
import storage from 'redux-persist/es/storage';

import {
  appSlice,
  mapSlice,
  MapState,
  meSlice,
  MeState,
  photosSlice,
  PhotosState,
  SettingsState,
} from '~/features';

import { mapViewTranform } from './persistTransforms';

export const settingsPersistConfig: PersistConfig<SettingsState> = {
  key: appSlice.name,
  storage,
  whitelist: <(keyof SettingsState)[]>['synced'],
};

export const mePersistConfig: PersistConfig<MeState> = {
  key: meSlice.name,
  storage,
  whitelist: <(keyof MeState)[]>['isLoggedIn'],
};

export const mapPersistConfig: PersistConfig<MapState> = {
  key: mapSlice.name,
  storage,
  transforms: [mapViewTranform],
  whitelist: <(keyof MapState)[]>['view'],
};

export const photosPersistConfig: PersistConfig<PhotosState> = {
  key: photosSlice.name,
  storage,
  whitelist: <(keyof PhotosState)[]>['galleryColsCount'],
};
