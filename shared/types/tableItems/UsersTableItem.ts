import { IdentityProvider } from '../IdentityProvider';
import { SyncedSettings } from '../SyncedSettings';

export type UsersTableItem = UserPropsFromCognito & {
  settings: SyncedSettings;
};

export type UserPropsFromCognito = {
  id: string;
  providerName: IdentityProvider;
  givenName: string;
  familyName: string;
  picture?: string;
  email: string;
  dateCreated: number;
};
