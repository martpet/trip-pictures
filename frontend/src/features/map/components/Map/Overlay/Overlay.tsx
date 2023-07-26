import { Flex } from '@adobe/react-spectrum';

import { SIDE_SPACE } from '~/common/consts';

import { BearingResetControl } from './BearingResetControl';
import { GeolocateControl } from './GeolocateControl';
import { MapDataSpinner } from './MapDataSpinner';
import { PitchResetControl } from './PitchResetControl';
import { ZoomControls } from './ZoomControls';

export function Overlay() {
  return (
    <Flex height="calc(100% - (100vh - 100dvh))">
      <Flex flexGrow={1} alignItems="end" justifyContent="end" margin={SIDE_SPACE}>
        <Flex direction="column" alignItems="center" gap="size-75">
          <MapDataSpinner marginBottom="size-100" />
          <PitchResetControl />
          <BearingResetControl />
          <ZoomControls />
          <GeolocateControl />
        </Flex>
      </Flex>
    </Flex>
  );
}
