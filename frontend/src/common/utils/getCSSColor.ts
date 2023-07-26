import { SpectrumColorValue } from '~/common/types';

export function getCSSColor(colorValue: SpectrumColorValue) {
  const spectrumRootEl = document.querySelector('#root > [class^="spectrum_"]');

  if (!spectrumRootEl) {
    throw new Error('Cannot find React Spectrum root DOM element');
  }

  return getComputedStyle(spectrumRootEl).getPropertyValue(`--spectrum-${colorValue}`);
}
