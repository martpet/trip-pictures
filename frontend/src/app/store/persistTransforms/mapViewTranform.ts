import { createTransform } from 'redux-persist';

import { getMapViewFromUrl, MapState } from '~/features/map';

export const mapViewTranform = createTransform(
  undefined,

  (view) => {
    const viewFromUrl = getMapViewFromUrl();

    if (viewFromUrl) {
      return viewFromUrl;
    }

    return view;
  },

  { whitelist: <(keyof MapState)[]>['view'] }
);
