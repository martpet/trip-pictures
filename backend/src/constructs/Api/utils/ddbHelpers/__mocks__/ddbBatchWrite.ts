export const ddbBatchWrite = vi
  .fn()
  .mockName('ddbBatchWrite')
  .mockReturnValue('dummyDdbBatchWriteResponse');
