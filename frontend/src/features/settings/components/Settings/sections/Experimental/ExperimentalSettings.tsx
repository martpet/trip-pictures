import { Flex } from '@adobe/react-spectrum';

import { PointsPreviewHoverEffectSetting } from './PointsPreviewHoverEffectSetting';
import { PointsPreviewSetting } from './PointsPreviewSetting';
import { TranslucentToolbarSetting } from './TranslucentToolbarSetting';

export function ExperimentalSettings() {
  return (
    <Flex direction="column">
      <PointsPreviewSetting />
      <PointsPreviewHoverEffectSetting />
      <TranslucentToolbarSetting />
    </Flex>
  );
}
