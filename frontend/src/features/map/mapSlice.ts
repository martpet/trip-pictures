import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LngLatBounds } from 'maplibre-gl';
import { ViewState } from 'react-map-gl';

import { startAppListening } from '~/app/store/middleware';
import { RootState } from '~/common/types';
import { MapView } from '~/features/map/types';
import { getMapViewFromUrl, setMapViewToUrl } from '~/features/map/utils';

export type MapState = {
  view?: MapView;
  bounds?: LngLatBounds;
};

const initialState: MapState = {
  view: getMapViewFromUrl(),
};

export const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    mapMoved(state, { payload }: PayloadAction<ViewState>) {
      state.view = payload;
    },
  },
});

// Actions
export const { mapMoved } = mapSlice.actions;

// Selectors
export const selectMapView = (state: RootState) => state.map.view;
export const selectBounds = (state: RootState) => state.map.bounds;

// Listeners
startAppListening({
  predicate(_, current, prev) {
    return current.map.view !== prev.map.view && window.location.pathname === '/';
  },
  effect(_, { getState }) {
    const { view } = getState().map;
    if (view) {
      setMapViewToUrl(view);
    }
  },
});
