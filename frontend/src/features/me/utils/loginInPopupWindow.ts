import { apiBaseUrl, loginWindowSuccessData } from '~/common/consts';
import { IdentityProvider } from '~/common/types';
import { appPath } from '~/common/utils';

export function loginInPopupWindow(provider: IdentityProvider) {
  const width = 600;
  const height = 650;
  const top = window.screenTop + window.innerHeight / 2 - height / 2;
  const left = window.screenLeft + window.innerWidth / 2 - width / 2;
  const features = `width=${width}, height=${height}, top=${top}, left=${left}, toolbar=no, menubar=no`;
  const url = appPath('/login/:provider', { provider });

  return new Promise<void>((resolve) => {
    const loginWindow = window.open(url, 'loginpopup', features);

    const listener = ({ origin, data }: MessageEvent) => {
      if (origin !== apiBaseUrl || data !== loginWindowSuccessData) {
        return;
      }
      resolve();
      loginWindow?.close();
      window.removeEventListener('message', listener);
    };

    window.addEventListener('message', listener);
  });
}
