import { Switch } from '@adobe/react-spectrum';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';

import { useAppDispatch } from '~/common/hooks';
import { selectIsPointPreviewModeOn, settingsChanged } from '~/features/settings';

export function PointsPreviewSetting() {
  const isPreviewModeOn = useSelector(selectIsPointPreviewModeOn);
  const dispatch = useAppDispatch();

  const setSelection = (isSelected: boolean) => {
    dispatch(settingsChanged({ isPointPreviewModeOn: isSelected }));
  };

  return (
    <Switch isSelected={isPreviewModeOn} onChange={setSelection}>
      <FormattedMessage
        defaultMessage="Photo previews"
        description="points preview setting"
      />
    </Switch>
  );
}
