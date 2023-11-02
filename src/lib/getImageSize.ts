import { ErrorMessage } from './constants';
import { Dimensions, Options } from './types';

export const getImageSize = (url: string, options: Options = {}): Promise<Dimensions> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(ErrorMessage.WINDOW_IS_NOT_DEFINED);
    }

    if (!url) {
      return reject(ErrorMessage.URL_IS_NOT_DEFINED);
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
      timer = window.setTimeout(() => reject(ErrorMessage.TIMEOUT), options.timeout);
    }
  });
};
