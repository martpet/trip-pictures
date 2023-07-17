import { Divider, Flex } from '@adobe/react-spectrum';
import { Slot } from '@martpet/react-slot';
import { useSelector } from 'react-redux';

import { Logo } from '~/common/components';
import { SIDE_SPACE, SLOTS, TOOLBAR_HEIGHT } from '~/common/consts';
import {
  useDefaultAlphaBackgroundStyle,
  useIsLoadingInitialTranslations,
} from '~/common/hooks';
import { selectIsToolbarTranslucent } from '~/features/settings';

import { ProfileButton } from './ProfileButton';
import { SettingsButton } from './SettingsButton';
import { UploadButton } from './UploadButton';

export function Toolbar() {
  const { isLoadingInitialTranslations } = useIsLoadingInitialTranslations();
  const isTranslucent = useSelector(selectIsToolbarTranslucent);
  const defaultAlphaBackground = useDefaultAlphaBackgroundStyle();

  return (
    <Flex
      position="sticky"
      top={0}
      zIndex={1}
      direction="row"
      height={TOOLBAR_HEIGHT}
      alignItems="center"
      UNSAFE_style={
        isTranslucent
          ? defaultAlphaBackground
          : { background: 'var(--spectrum-alias-background-color-default)' }
      }
    >
      <Flex direction="row" gap="size-200" marginX={SIDE_SPACE} flexGrow={1}>
        <Logo />

        <Slot name={SLOTS.toolbar} />

        {!isLoadingInitialTranslations && (
          <Flex direction="row" gap="size-50" alignItems="center" marginStart="auto">
            <Slot name={SLOTS.tooLbarRight} />
            <UploadButton />
            <SettingsButton />
            <ProfileButton />
          </Flex>
        )}
      </Flex>

      <Divider size="S" />
    </Flex>
  );
}
