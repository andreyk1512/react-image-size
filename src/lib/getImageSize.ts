import { Dimensions, Options } from './types';

export const Error = {
  WINDOW_IS_NOT_DEFINED: 'Window is not defined',
  URL_IS_NOT_DEFINED: 'Url is not defined',
  TIMEOUT: 'Timeout',
} as const;

export const getImageSize = (url: string, options: Options = {}): Promise<Dimensions> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(Error.WINDOW_IS_NOT_DEFINED);
    }

    if (!url) {
      return reject(Error.URL_IS_NOT_DEFINED);
    }

    let timer: number | null = null;

    const img = new Image();

    img.addEventListener('load', () => {
      if (timer) {
        window.clearTimeout(timer);
      }

      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    });

    img.addEventListener('error', (event) => {
      if (timer) {
        window.clearTimeout(timer);
      }

      reject(`${event.type}: ${event.message}`);
    });

    img.src = url;

    if (options.timeout) {
      timer = window.setTimeout(() => reject(Error.TIMEOUT), options.timeout);
    }
  });
};
