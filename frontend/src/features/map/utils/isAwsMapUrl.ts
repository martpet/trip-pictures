import { AWS_MAPS_HOSTNAME_REGEXP } from '~/common/consts';

export function isAwsMapUrl(input: RequestInfo | URL) {
  let url: URL;

  if (typeof input === 'string') {
    url = new URL(input);
  } else if ('url' in input) {
    url = new URL(input.url);
  } else {
    url = input;
  }

  return AWS_MAPS_HOSTNAME_REGEXP.test(url.hostname);
}
