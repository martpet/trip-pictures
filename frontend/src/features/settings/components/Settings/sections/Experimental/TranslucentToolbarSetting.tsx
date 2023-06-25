import { Switch } from '@adobe/react-spectrum';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';

import { useAppDispatch } from '~/common/hooks';
import { selectIsToolbarTranslucent, settingsChanged } from '~/features/settings';

export function TranslucentToolbarSetting() {
  const isTranslucent = useSelector(selectIsToolbarTranslucent);
  const dispatch = useAppDispatch();

  const setSelection = (isSelected: boolean) => {
    dispatch(settingsChanged({ isToolbarTranslucent: isSelected }));
  };

  return (
    <Switch isSelected={isTranslucent} onChange={setSelection}>
      <FormattedMessage
        defaultMessage="Translucent toolbar"
        description="toolbar opacity setting"
      />
    </Switch>
  );
}
