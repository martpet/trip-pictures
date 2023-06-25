type Props = {
  userId: string;
  fingerprint: string;
};

export function createPhotoS3Key({ userId, fingerprint }: Props) {
  return `${userId}/${fingerprint}`;
}
