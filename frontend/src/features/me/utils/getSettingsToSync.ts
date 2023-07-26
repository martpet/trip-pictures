import { RequireAtLeastOne } from 'type-fest';

import { SyncedSettings } from '~/common/types';

type Props = {
  localSettings: SyncedSettings;
  remoteSettings: SyncedSettings;
};

export const getSettingsToSync = ({ localSettings, remoteSettings }: Props) => {
  const settingsKeys = Object.keys(localSettings) as (keyof SyncedSettings)[];
  const localPatch = {} as RequireAtLeastOne<SyncedSettings>;
  const remotePatch = {} as RequireAtLeastOne<SyncedSettings>;

  settingsKeys.forEach((key) => {
    const localValue = localSettings[key];
    const remoteValue = remoteSettings[key];

    if (localValue === remoteValue) {
      return;
    }

    if (localValue === undefined) {
      Object.assign(localPatch, { [key]: remoteValue });
    } else {
      Object.assign(remotePatch, { [key]: localValue });
    }
  });

  return {
    localPatch: Object.keys(localPatch).length ? localPatch : undefined,
    remotePatch: Object.keys(remotePatch).length ? remotePatch : undefined,
  };
};
