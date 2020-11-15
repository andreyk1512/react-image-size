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

    resolve(img);
  });

  img.addEventListener('error', () => {
    if (timer) { clearTimeout(timer); }

    reject(null);
  });

  img.src = url;

  if (rejectTimeout) {
    timer = setTimeout(() => reject(null), rejectTimeout);
  }
});
