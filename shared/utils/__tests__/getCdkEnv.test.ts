import { getCdkEnv } from '../getCdkEnv';

beforeEach(() => {
  process.env.ENV_NAME = 'production';
});

describe('getCdkEnv', () => {
  it('returns a correct value', () => {
    expect(getCdkEnv()).toMatchSnapshot();
  });

  describe('when envName is invalid', () => {
    beforeEach(() => {
      process.env.ENV_NAME = 'foobar';
    });

    it('throws an error', () => {
      expect(() => {
        getCdkEnv();
      }).toThrowErrorMatchingSnapshot();
    });
  });
});
