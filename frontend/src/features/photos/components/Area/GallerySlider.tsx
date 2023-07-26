import { ActionButton, Flex, Slider } from '@adobe/react-spectrum';
import { unwrapDOMRef, useResizeObserver } from '@react-spectrum/utils';
import { DOMRefValue } from '@react-types/shared';
import IconAdd from '@spectrum-icons/workflow/Add';
import IconRemove from '@spectrum-icons/workflow/Remove';
import { Dispatch, RefObject, SetStateAction, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';

import { transition } from '~/common/utils';

const MIN_COLS_COUNT = 1;
const MIN_COL_WIDTH = 28;

function calcColWidth({
  containerWidth,
  colsCount,
  gridGap,
}: {
  containerWidth: number;
  colsCount: number;
  gridGap: number;
}) {
  return Math.round((containerWidth - (colsCount - 1) * gridGap) / colsCount);
}

function calcColsCount({
  containerWidth,
  colWidth,
  gridGap,
  rounding,
}: {
  containerWidth: number;
  colWidth: number;
  gridGap: number;
  rounding: 'ceil' | 'round';
}) {
  return Math[rounding]((containerWidth + gridGap) / (colWidth + gridGap));
}

interface GalleryProps {
  colsCount: number;
  setColsCount: Dispatch<SetStateAction<number>>;
  appliedColWidth: number | null;
  setAppliedColWidth: Dispatch<SetStateAction<number | null>>;
  gridGap: number;
  containerDOMRef: RefObject<DOMRefValue<HTMLDivElement>>;
}

export function GallerySizeSlider({
  colsCount,
  setColsCount,
  appliedColWidth,
  setAppliedColWidth,
  containerDOMRef,
  gridGap,
}: GalleryProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const computedColWidth = calcColWidth({ containerWidth, colsCount, gridGap });
  const usedColWidth = appliedColWidth || computedColWidth;
  const maxColWidth = calcColWidth({
    containerWidth,
    colsCount: MIN_COLS_COUNT,
    gridGap,
  });
  const containerRef = unwrapDOMRef(containerDOMRef);
  const { formatMessage } = useIntl();
  const isAtMin = usedColWidth <= MIN_COL_WIDTH;
  const isAtMax = usedColWidth >= maxColWidth;

  useResizeObserver({
    ref: containerRef,
    onResize: () => {
      if (!containerRef.current) return;
      setContainerWidth(parseInt(getComputedStyle(containerRef.current).width));
    },
  });

  useEffect(() => {
    if (!appliedColWidth) return;
    const tempColsCount = calcColsCount({
      containerWidth,
      gridGap,
      colWidth: appliedColWidth,
      rounding: 'ceil',
    });
    setColsCount(tempColsCount);
  }, [appliedColWidth, gridGap]);

  const onChangeEnd = async () => {
    if (!appliedColWidth) return;
    const finalColsCount = calcColsCount({
      containerWidth,
      colWidth: appliedColWidth,
      gridGap,
      rounding: 'round',
    });
    const finalColWidth = calcColWidth({
      containerWidth,
      colsCount: finalColsCount,
      gridGap,
    });
    await transition({
      from: appliedColWidth,
      to: finalColWidth,
      handler: setAppliedColWidth,
    });
    setColsCount(finalColsCount);
    setAppliedColWidth(null);
  };

  if (!containerWidth) {
    return null;
  }

  const sliderLabel = formatMessage({
    defaultMessage: 'Thumbnail size',
    description: 'gallery size slider aria-label',
  });

  const buttonZoomOutLabel = formatMessage({
    defaultMessage: 'Zoom out',
    description: 'gallery size slider minus button',
  });

  const buttonZoomInLabel = formatMessage({
    defaultMessage: 'Zoom in',
    description: 'gallery size slider minus button',
  });

  const buttonProps = {
    isQuiet: true,
    UNSAFE_style: { minWidth: 22, height: 22 },
  };

  const iconProps = {
    UNSAFE_style: { width: 12, height: 12 },
  } as const;

  return (
    <Flex alignItems="center">
      <ActionButton
        {...buttonProps}
        isDisabled={isAtMin}
        onPress={() => setColsCount((count) => count + 1)}
        aria-label={buttonZoomOutLabel}
      >
        <IconRemove {...iconProps} />
      </ActionButton>
      <Slider
        isFilled={false}
        width="size-1500"
        minValue={MIN_COL_WIDTH}
        maxValue={maxColWidth}
        value={usedColWidth}
        onChange={setAppliedColWidth}
        onChangeEnd={onChangeEnd}
        aria-label={sliderLabel}
      />
      <ActionButton
        {...buttonProps}
        isDisabled={isAtMax}
        onPress={() => setColsCount((count) => count - 1)}
        aria-label={buttonZoomInLabel}
      >
        <IconAdd {...iconProps} />
      </ActionButton>
    </Flex>
  );
}
