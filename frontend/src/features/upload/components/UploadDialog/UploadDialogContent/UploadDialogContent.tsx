import { DropZone } from './DropZone';
import { UploadAlerts } from './UploadAlerts';
import { UploadsGallery } from './UploadsGallery/UploadsGallery';

export default function UploadDialogContent() {
  return (
    <DropZone>
      <UploadAlerts />
      <UploadsGallery />
    </DropZone>
  );
}
