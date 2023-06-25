import { DialogTrigger } from '@adobe/react-spectrum';
import { useIsMobileDevice } from '@react-spectrum/utils';
import { PropsWithChildren } from 'react';
import { useSelector } from 'react-redux';

import { useAppDispatch } from '~/common/hooks';
import { selectUploadDialogOpened, uploadDialogToggled } from '~/features/app';
import { selectIsUploadFlowEnded } from '~/features/upload/uploadSelectors';

export function UploadDialogTrigger({ children }: PropsWithChildren) {
  const isDialogOpen = useSelector(selectUploadDialogOpened);
  const isFlowEnded = useSelector(selectIsUploadFlowEnded);
  const isMobile = useIsMobileDevice();
  const dispatch = useAppDispatch();

  return (
    // @ts-ignore
    <DialogTrigger
      type={isMobile ? 'fullscreenTakeover' : 'fullscreen'}
      isOpen={isDialogOpen}
      isKeyboardDismissDisabled={isFlowEnded}
      onOpenChange={(isOpen) => dispatch(uploadDialogToggled(isOpen))}
    >
      {children}
    </DialogTrigger>
  );
}
