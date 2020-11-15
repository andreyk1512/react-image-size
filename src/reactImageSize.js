/**
 * Get dimensions of any image by url
 * @param {string} url
 * @param {number} [timeout] timeout for reject
 * @return {Promise<{ width: number, height: number }>}
 */
export default (url, timeout) => new Promise((resolve, reject) => {
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

  if (timeout) {
    timer = setTimeout(() => reject(null), timeout);
  }
});
