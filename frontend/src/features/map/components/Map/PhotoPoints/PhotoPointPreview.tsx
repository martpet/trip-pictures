import { Flex, View } from '@adobe/react-spectrum';
import { useHover } from '@react-aria/interactions';
import { FocusableElement } from '@react-types/shared';
import LocationIcon from '@spectrum-icons/workflow/Location';
import turfBBox from '@turf/bbox';
import { featureCollection } from '@turf/helpers';
import { GeoJSON } from 'geojson';
import geohash from 'ngeohash';
import { DOMAttributes, MouseEventHandler, ReactNode } from 'react';
import { GeoJSONSource, MapboxGeoJSONFeature, MapRef, useMap } from 'react-map-gl';
import { useSelector } from 'react-redux';
import { useLocation } from 'wouter';

import { UploadedImage } from '~/common/components';
import { MAP_ID, POINTS_SOURCE_ID } from '~/common/consts';
import { appPath } from '~/common/utils';
import { colors, MAP_PRECISION, PIN_SIZE } from '~/features/map';
import { selectIsPointPreviewHoverEffectOn } from '~/features/settings';

const BORDER_COLOR = colors.pin;
const BORDER_HOVER_COLOR = colors.pinHover;
const IMG_SIZE = 80;

interface ThumbProps {
  isHovered: boolean;
  fingerprint: string;
  colsCount: number;
}

function Thumb({ isHovered, fingerprint }: ThumbProps) {
  return (
    <View
      colorVersion={6}
      overflow="hidden"
      position="relative"
      width={IMG_SIZE}
      height={IMG_SIZE}
      backgroundColor="gray-700"
      borderColor={isHovered ? BORDER_HOVER_COLOR : BORDER_COLOR}
      UNSAFE_style={{
        borderWidth: 3,
        borderRadius: 9,
        borderStyle: 'solid',
      }}
    >
      <UploadedImage
        width={IMG_SIZE}
        height={IMG_SIZE}
        fingerprint={fingerprint}
        colsCount={1}
      />
    </View>
  );
}

function Tail() {
  return (
    <LocationIcon
      position="absolute"
      left="50%"
      bottom={0}
      width={PIN_SIZE}
      height={PIN_SIZE}
      UNSAFE_style={{
        transform: 'translateX(-50%)',
      }}
    />
  );
}

interface BadgeProps {
  count?: string;
}

function Badge({ count }: BadgeProps) {
  if (!count) return null;
  return (
    <Flex
      position="absolute"
      right={-8}
      top={-11}
      minWidth={26}
      height={25}
      justifyContent="center"
      alignItems="center"
      UNSAFE_style={{
        boxSizing: 'border-box',
        padding: '0 6px',
        fontSize: 13,
        color: `var(--spectrum-${colors.pinCountText})`,
        background: `var(--spectrum-${colors.pinCount})`,
        borderRadius: 15,
        lineHeight: 1,
      }}
    >
      {count}
    </Flex>
  );
}

interface ButtonProps {
  hoverProps: DOMAttributes<FocusableElement>;
  onClick: MouseEventHandler;
  isHovered: boolean;
  children: ReactNode;
}

function Button({ hoverProps, onClick, isHovered, children }: ButtonProps) {
  return (
    <button
      {...hoverProps}
      type="button"
      onClick={onClick}
      style={{
        position: 'relative',
        padding: '0 0 10px 0',
        color: `var(--spectrum-${isHovered ? BORDER_HOVER_COLOR : BORDER_COLOR})`,
        cursor: isHovered ? 'pointer' : 'default',
        border: 'none',
        background: 'none',
      }}
    >
      {children}
    </button>
  );
}

type Props = {
  fingerprint: string;
  count?: string;
  clusterId?: number;
  feature: MapboxGeoJSONFeature;
};

interface GetBBoxHashProps {
  mapRef?: MapRef;
  clusterId?: number;
  feature: MapboxGeoJSONFeature;
}

function getBobxHash({ mapRef, clusterId, feature }: GetBBoxHashProps) {
  const source = mapRef?.getSource(POINTS_SOURCE_ID) as GeoJSONSource;
  const getHash = (geojson: GeoJSON) => {
    const [west, south, north, east] = turfBBox(geojson);
    const swHash = geohash.encode(south, west, MAP_PRECISION.clusterBBoxHash);
    const neHash = geohash.encode(east, north, MAP_PRECISION.clusterBBoxHash);
    return swHash + neHash;
  };
  if (clusterId) {
    return new Promise<string>((resolve, reject) => {
      source.getClusterLeaves(Number(clusterId), Infinity, 0, (error, features) => {
        if (error) reject(error);
        resolve(getHash(featureCollection(features)));
      });
    });
  }
  return getHash(feature);
}

export function PhotoPointPreview({ fingerprint, count, clusterId, feature }: Props) {
  const isHoverEnabled = useSelector(selectIsPointPreviewHoverEffectOn);
  const { hoverProps, isHovered } = useHover({ isDisabled: !isHoverEnabled });
  const [, setLocation] = useLocation();
  const { [MAP_ID]: mapRef } = useMap();

  const clickHandler: MouseEventHandler = async (event) => {
    event.stopPropagation();
    const bboxHash = await getBobxHash({ mapRef, clusterId, feature });
    setLocation(appPath('/:bboxHash', { bboxHash }));
  };

  return (
    <Button onClick={clickHandler} isHovered={isHovered} hoverProps={hoverProps}>
      <Tail />
      <Thumb fingerprint={fingerprint} isHovered={isHovered} colsCount={1} />
      <Badge count={count} />
    </Button>
  );
}
