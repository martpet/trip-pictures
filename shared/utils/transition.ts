interface Transition {
  from: number;
  to: number;
  handler(current: number): void;
  duration?: number;
  delay?: number;
}

export function transition({
  from,
  to,
  handler,
  duration = 150,
  delay = 20,
}: Transition) {
  return new Promise<void>((resolve) => {
    const delta = to - from;
    if (!delta) {
      resolve();
      return;
    }
    let current = from;
    let ticks = duration / delay;
    const step = delta / ticks;
    const timer = setInterval(() => {
      current += step;
      handler(current);
      ticks--;
      if (ticks <= 0) {
        clearInterval(timer);
        resolve();
      }
    }, delay);
  });
}
