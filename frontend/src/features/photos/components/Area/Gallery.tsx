import { Grid, repeat, View } from '@adobe/react-spectrum';
import { ContentFor } from '@martpet/react-slot';
import { useIsMobileDevice } from '@react-spectrum/utils';
import { DOMRefValue } from '@react-types/shared';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { BackButton, UploadedImage } from '~/common/components';
import { SLOTS } from '~/common/consts';
import { useAppDispatch, useDebounce } from '~/common/hooks';
import { Photo } from '~/common/types';
import { apiUrl } from '~/common/utils';
import { galleryColsCountChanged, selectGalleryColsCount } from '~/features/photos';

import { GallerySizeSlider } from './GallerySlider';

interface GalleryProps {
  photos: Pick<Photo, 'fingerprint'>[];
}

export function Gallery({ photos }: GalleryProps) {
  const isMobile = useIsMobileDevice();
  const storedColsCount = useSelector(selectGalleryColsCount);
  const initialColsCount = isMobile ? 4 : storedColsCount;
  const [colsCount, setColsCount] = useState(initialColsCount);
  const debouncedColsCount = useDebounce(colsCount);
  const [appliedColWidth, setAppliedColWidth] = useState<number | null>(null);

  const containerDOMRef = useRef<DOMRefValue<HTMLDivElement>>(null);
  const dispatch = useAppDispatch();
  const gridGap = colsCount === 1 ? 10 : 2;

  const SHOW_BACK_BUTTON = false;

  useEffect(() => {
    if (debouncedColsCount !== storedColsCount) {
      dispatch(galleryColsCountChanged(debouncedColsCount));
    }
  }, [debouncedColsCount]);

  return (
    <>
      {!isMobile && (
        <ContentFor slot={SLOTS.toolbar} order={-1}>
          {SHOW_BACK_BUTTON && <BackButton path="/" />}
          <GallerySizeSlider
            colsCount={colsCount}
            setColsCount={setColsCount}
            appliedColWidth={appliedColWidth}
            setAppliedColWidth={setAppliedColWidth}
            gridGap={gridGap}
            containerDOMRef={containerDOMRef}
          />
        </ContentFor>
      )}

      <View
        overflow="hidden"
        backgroundColor="gray-100"
        padding={0}
        ref={containerDOMRef}
      >
        <Grid columns={repeat(colsCount, appliedColWidth ?? '1fr')} gap={gridGap}>
          {photos.map(({ fingerprint }) => (
            <a
              href={apiUrl('/images/:fingerprint', {
                pathParams: { fingerprint },
              })}
              key={fingerprint}
              target="_blank"
              rel="noreferrer"
            >
              <UploadedImage
                key={fingerprint}
                fingerprint={fingerprint}
                colsCount={colsCount}
              />
            </a>
          ))}
        </Grid>
      </View>
    </>
  );
}
