import { SdkStreamMixin } from '@aws-sdk/types';
import { DetectModerationLabelsCommand, RekognitionClient } from 'lambda-layer';
import sharp from 'sharp';

const rekognition = new RekognitionClient({});

type Props = {
  stream: SdkStreamMixin;
  quality?: number;
  width?: number;
  height?: number;
};

export async function processImage({
  stream,
  width = 1500,
  height,
  quality = 100,
}: Props) {
  const uint8 = await stream.transformToByteArray();
  const image = sharp(uint8).rotate().resize(width, height).jpeg({ quality });
  let buffer = await image.toBuffer();

  const moderationCommand = new DetectModerationLabelsCommand({
    Image: { Bytes: buffer },
    MinConfidence: 90,
  });

  const { ModerationLabels } = await rekognition.send(moderationCommand);

  const isModerated = ModerationLabels?.some(({ Name }) => Name === 'Explicit Nudity');

  if (isModerated) {
    image.blur(75);
    buffer = await image.toBuffer();
  }

  const base64 = buffer.toString('base64');
  return base64;
}
