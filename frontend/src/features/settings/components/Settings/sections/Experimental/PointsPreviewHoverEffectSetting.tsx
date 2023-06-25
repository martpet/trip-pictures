import { Switch } from '@adobe/react-spectrum';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';

import { useAppDispatch } from '~/common/hooks';
import { selectIsPointPreviewHoverEffectOn, settingsChanged } from '~/features/settings';

export function PointsPreviewHoverEffectSetting() {
  const isHoverModeOn = useSelector(selectIsPointPreviewHoverEffectOn);
  const dispatch = useAppDispatch();

  const setSelection = (isSelected: boolean) => {
    dispatch(settingsChanged({ isPointPreviewHoverEffectOn: isSelected }));
  };

  return (
    <Switch isSelected={isHoverModeOn} onChange={setSelection}>
      <FormattedMessage
        defaultMessage="Photo previews hover effect"
        description="points preview hover setting"
      />
    </Switch>
  );
}
