import { ViewState } from 'react-map-gl';

export type MapView = Omit<ViewState, 'padding'>;
