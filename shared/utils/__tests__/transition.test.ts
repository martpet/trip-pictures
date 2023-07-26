import { transition } from '../transition';

const handler = vi.fn();

describe('transition', () => {
  it('calls handler n times', async () => {
    await transition({
      from: 1,
      to: 4,
      duration: 100,
      delay: 10,
      handler,
    });
    expect(vi.mocked(handler).mock.calls).toMatchSnapshot();
  });

  it('resolves without calling handler if delta is 0', async () => {
    await transition({ from: 3, to: 3, handler });
    expect(vi.mocked(handler)).not.toBeCalled();
  });
});
