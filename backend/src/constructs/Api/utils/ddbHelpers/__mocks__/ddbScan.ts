export const ddbScan = vi
  .fn()
  .mockName('ddbScan')
  .mockResolvedValue('dummyDdbScanResponse');
