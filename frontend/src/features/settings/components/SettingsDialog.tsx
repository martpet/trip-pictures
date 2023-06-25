import { Content, Dialog, Divider, Heading } from '@adobe/react-spectrum';
import { FormattedMessage } from 'react-intl';

import { SettingsLazy } from '~/features/settings';

export function SettingsDialog() {
  return (
    <Dialog size="L">
      <Heading>
        <FormattedMessage
          defaultMessage="Settings"
          description="settings dialog heading"
        />
      </Heading>
      <Divider />
      <Content>
        <SettingsLazy />
      </Content>
    </Dialog>
  );
}
