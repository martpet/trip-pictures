const result = {
  resize: vi.fn().mockName('resize').mockReturnThis(),
  jpeg: vi.fn().mockName('jpeg').mockReturnThis(),
  blur: vi.fn().mockName('blur').mockReturnThis(),
  rotate: vi.fn().mockName('rotate').mockReturnThis(),
  metadata: vi.fn().mockName('metadata').mockResolvedValue({ width: 100, height: 50 }),
  toBuffer: vi
    .fn()
    .mockName('toBuffer')
    .mockResolvedValue({
      toString: vi.fn().mockName('toString').mockReturnValue('dummyBufferToString'),
    }),
};

export default vi.fn().mockName('sharp').mockReturnValue(result);
