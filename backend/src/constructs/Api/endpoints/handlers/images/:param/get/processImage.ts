import { SdkStreamMixin } from '@aws-sdk/types';
import { DetectModerationLabelsCommand, RekognitionClient } from 'lambda-layer';
import sharp from 'sharp';

const rekognition = new RekognitionClient({});

const MAX_WIDTH = 1920;

type Props = {
  stream: SdkStreamMixin;
  quality?: number;
  width?: number;
  height?: number;
};

export async function processImage({
  stream,
  width = MAX_WIDTH,
  height,
  quality = 100,
}: Props) {
  const uint8 = await stream.transformToByteArray();
  const image = sharp(uint8);
  let usedWidth: number | null = Math.min(width, MAX_WIDTH);
  let usedHeight = height;
  const meta = await image.metadata();
  if (meta.height && meta.width && meta.height > meta.width) {
    usedHeight = usedWidth;
    usedWidth = null;
  }
  image.rotate().resize(usedWidth, usedHeight).jpeg({ quality });
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
