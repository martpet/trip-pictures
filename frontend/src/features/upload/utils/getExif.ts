import type { NumberTag, StringArrayTag } from 'exifreader';

import { Exif } from '~/common/types';
import { MAP_PRECISION } from '~/features/map';

export async function getExif(file: File): Promise<Partial<Exif>> {
  const { default: ExifReader } = await import('exifreader');
  const tags = await ExifReader.load(file, { expanded: true });
  const { gps, exif } = tags;
  const { Altitude, Latitude, Longitude } = gps || {};
  const {
    DateTimeOriginal,
    OffsetTimeOriginal,
    GPSDestBearing,
    GPSHPositioningError,
    GPSSpeed,
    GPSSpeedRef,
  } = exif || {};

  return {
    dateOriginal:
      DateTimeOriginal === undefined || OffsetTimeOriginal === undefined
        ? undefined
        : dateTimeISO(DateTimeOriginal, OffsetTimeOriginal),

    altitude:
      Altitude === undefined
        ? undefined
        : Number(Altitude.toFixed(MAP_PRECISION.altitude)),

    lat:
      Latitude === undefined ? undefined : Number(Latitude.toFixed(MAP_PRECISION.lonlat)),

    lon:
      Longitude === undefined
        ? undefined
        : Number(Number(Longitude).toFixed(MAP_PRECISION.lonlat)),

    destBearing: GPSDestBearing?.description
      ? undefined
      : Number(Number(GPSDestBearing?.description).toFixed(MAP_PRECISION.bearing)),

    hPositioningError:
      GPSHPositioningError?.description === undefined
        ? undefined
        : Number(
            Number(GPSHPositioningError.description).toFixed(
              MAP_PRECISION.hPositioningError
            )
          ),

    speed:
      GPSSpeed === undefined || GPSSpeedRef === undefined
        ? undefined
        : length(GPSSpeed, GPSSpeedRef, MAP_PRECISION.speed),

    make: exif?.Make?.description,

    model: exif?.Model?.description,

    lensModel: exif?.LensModel?.description,
  };
}

function length(
  lengthTag: NumberTag,
  unitTag?: StringArrayTag | undefined,
  digits?: number
) {
  const result = Number(Number(lengthTag?.description).toFixed(digits));

  if (unitTag && typeof result === 'number') {
    switch (unitTag.value[0]) {
      case 'M':
        return milesToKm(result);
      case 'N':
        return knotsToKm(result);
      default:
        return result;
    }
  }
  return result;
}

function dateTimeISO(dateTag: StringArrayTag, offsetTag: StringArrayTag) {
  const [date, time] = dateTag.value[0].split(' ');
  const utcOffset = offsetTag.value[0];
  return `${date.replaceAll(':', '-')}T${time}${utcOffset}`;
}

function milesToKm(miles: number) {
  return miles * 0.621371;
}

function knotsToKm(knots: number) {
  return knots * 1.852;
}
