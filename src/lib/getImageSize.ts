import { Dimensions, Options } from './types';

export const getImageSize = (url: string, options: Options = {}): Promise<Dimensions> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject('Window is not defined');
    }

    if (!url) {
      return reject('Url is not defined');
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
      timer = window.setTimeout(() => reject('Timeout'), options.timeout);
    }
  });
};
