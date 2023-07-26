import { ToastQueue } from '@react-spectrum/toast';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { createIntl } from 'react-intl';

import { getTranslations } from '~/app';
import { addAppListener } from '~/app/store/middleware';
import { defaultLocale, intlCache } from '~/common/consts';
import { RootState } from '~/common/types';
import { selectLanguage } from '~/features/settings';
import {
  removeFile,
  selectFilesPendingTransfer,
  selectPresignedPosts,
  transferCompleted,
  transferFailed,
  transfersProgressUpdated,
} from '~/features/upload';

export const transferFiles = createAsyncThunk(
  'upload/filesTransferStatus',
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState;
    const files = selectFilesPendingTransfer(state);
    const presignedPosts = selectPresignedPosts(state);
    const requests: Record<string, XMLHttpRequest> = {};
    const progress: Record<string, number> = {};
    const isFirefox = navigator.userAgent.includes('Firefox');
    const locale = selectLanguage(state);
    const selectTranslations = getTranslations.select(locale);
    const { data: translations } = selectTranslations(state);
    const messages = translations || undefined;
    const { formatMessage } = createIntl({ locale, defaultLocale, messages }, intlCache);
    const toast = { close: () => {} };
    let progressDispatchedAt = 0;

    function offlineListener() {
      toast.close();

      toast.close = ToastQueue.negative(
        formatMessage({
          defaultMessage: 'Network is offline',
          description: 'transfer files thunk toast - network offline',
        })
      );

      // Abort requests in Firefox. By default:
      // - Safari aborts all requests when network goes down.
      // - Chrome aborts pending requests, but resumes active requests when network is back.
      // - Firefox doesn't abort or resume requests.
      if (isFirefox) {
        Object.values(requests).forEach((xhr) => xhr.abort());
      }
    }

    function onlineListener() {
      toast.close();

      toast.close = ToastQueue.info(
        formatMessage({
          defaultMessage: 'Network is online',
          description: 'transfer files thunk toast - network online',
        })
      );
    }

    window.addEventListener('offline', offlineListener);
    window.addEventListener('online', onlineListener);

    const unsubscribeFileRemovalListener = dispatch(
      addAppListener({
        actionCreator: removeFile.fulfilled,
        effect({ payload }) {
          requests[payload].abort();
        },
      })
    );

    await Promise.allSettled(
      files.map(async ({ id, objectURL }) => {
        const { url, fields } = presignedPosts[id];
        const form = new FormData();
        const blob = await fetch(objectURL).then((r) => r.blob());
        const xhr = new XMLHttpRequest();

        requests[id] = xhr;
        Object.entries(fields).forEach((entry) => form.append(...entry));
        form.append('file', blob);

        return new Promise<void>((resolve) => {
          xhr.onload = () => {
            if (xhr.status === 204) {
              dispatch(transferCompleted(id));
            } else {
              dispatch(transferFailed(id));
            }
            resolve();
          };

          xhr.onerror = () => {
            dispatch(transferFailed(id));
            resolve();
          };

          xhr.upload.onabort = () => {
            dispatch(transferFailed(id));
            resolve();
          };

          xhr.upload.onprogress = ({ loaded, total }) => {
            const now = Date.now();
            progress[id] = Math.floor((loaded / total) * 100);
            if (progressDispatchedAt < now - 250) {
              progressDispatchedAt = now;
              dispatch(transfersProgressUpdated({ ...progress }));
            }
          };

          xhr.open('POST', url);
          xhr.send(form);
        });
      })
    );

    // @ts-ignore
    unsubscribeFileRemovalListener();

    window.removeEventListener('offline', offlineListener);
    window.removeEventListener('online', onlineListener);
  }
);
