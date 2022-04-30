/**
 * Get dimensions of any image by url
 * @param {string} url
 * @param {number} [rejectTimeout] timeout for reject
 * @return {Promise<{ width: number, height: number }>}
 */
export default (url, rejectTimeout) => new Promise((resolve, reject) => {
  let timer = null;

  const img = new Image();

  img.addEventListener('load', () => {
    if (timer) { clearTimeout(timer); }

    resolve({ width: img.width, height: img.height });
  });

  img.addEventListener('error', (event) => {
    if (timer) { clearTimeout(timer); }

    reject(`${event.type}: ${event.message}`);
  });

  img.src = url;

  if (rejectTimeout) {
    timer = setTimeout(() => reject('Timeout exception'), rejectTimeout);
  }
});
