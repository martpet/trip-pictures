import { createPhotoFingerprint } from '../createPhotoFingerprint';
import { parsePhotoFingerprint } from '../parsePhotoFingerprint';

describe('createPhotoFingerprint', () => {
  it('returns a correct value', () => {
    expect(
      createPhotoFingerprint({
        date: 'dummyDate',
        lon: 1.23,
        lat: 3.45,
      })
    ).toMatchSnapshot();
  });
});

describe('parsePhotoFingerprint', () => {
  it('returns a correct value', () => {
    expect(
      parsePhotoFingerprint('2022-08-13T09:52:30_20.176583_39.505653')
    ).toMatchSnapshot();
  });
});
