import { createPhotoS3Key } from '../createPhotoS3Key';

describe('createPhotoS3Key', () => {
  it('return correct value', () => {
    expect(
      createPhotoS3Key({ userId: 'dummyUserId', fingerprint: 'dummyFingerprint' })
    ).toMatchSnapshot();
  });
});
