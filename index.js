const ERROR = {
  WINDOW_VARIABLE_NOT_FOUND: 'Window variable not found',
  TIMEOUT: 'Timeout exception',
};

/**
 * Get dimensions of any image by url
 * @param {string} url
 * @param {number} [rejectTimeout] timeout for reject
 * @return {Promise<{ width: number, height: number }>}
 */
export default (url, rejectTimeout) => new Promise((resolve, reject) => {
  if (typeof window === 'undefined') {
    return reject(ERROR.WINDOW_VARIABLE_NOT_FOUND);
  }

  let timer = null;

  const img = new Image();

  img.addEventListener('load', () => {
    if (timer) { clearTimeout(timer); }

    resolve({ width: img.naturalWidth, height: img.naturalHeight });
  });

  img.addEventListener('error', (event) => {
    if (timer) { clearTimeout(timer); }

    reject(`${event.type}: ${event.message}`);
  });

  img.src = url;

  if (rejectTimeout) {
    timer = setTimeout(() => reject(ERROR.TIMEOUT), rejectTimeout);
  }
});
