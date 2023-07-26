import { ColorScheme } from './ColorScheme';
import { Language } from './Language';
import { SettingsDialogTab } from './SettingsDialogTab';
import { SyncedSettingsKey } from './SyncedSettingsKey';
import { WithKeys } from './utilTypes';

export type SyncedSettings = WithKeys<
  SyncedSettingsKey,
  {
    settingsDialogTab?: SettingsDialogTab;
    language?: Language;
    colorScheme?: ColorScheme;
    isToolbarTranslucent?: boolean;
    isPointPreviewModeOn?: boolean;
    isPointPreviewHoverEffectOn?: boolean;
  }
>;
