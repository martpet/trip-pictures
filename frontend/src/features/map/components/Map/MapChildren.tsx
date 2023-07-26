import { memo } from 'react';

import { Overlay } from './Overlay/Overlay';
import { PhotoPoints } from './PhotoPoints/PhotoPoints';

export const MapChildren = memo(function MapChildren() {
  return (
    <>
      <Overlay />
      <PhotoPoints />
    </>
  );
});
