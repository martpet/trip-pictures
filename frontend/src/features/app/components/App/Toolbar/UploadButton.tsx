import { ActionButton, Text } from '@adobe/react-spectrum';
import { useIsMobileDevice } from '@react-spectrum/utils';
import UploadIcon from '@spectrum-icons/workflow/AddCircle';
import { FormattedMessage, useIntl } from 'react-intl';

import { UploadDialogLazy, UploadDialogTrigger } from '~/features/upload';

const SHOW_TEXT = false;

export function UploadButton() {
  const { formatMessage } = useIntl();
  const isMobile = useIsMobileDevice();

  return (
    <UploadDialogTrigger>
      <ActionButton
        isQuiet
        aria-label={formatMessage({
          defaultMessage: 'Upload photos',
          description: 'toolbar upload button aria label',
        })}
      >
        <UploadIcon />
        {SHOW_TEXT && !isMobile && (
          <Text>
            <FormattedMessage defaultMessage="Add photos" description="uplaod button" />
          </Text>
        )}
      </ActionButton>
      <UploadDialogLazy />
    </UploadDialogTrigger>
  );
}
