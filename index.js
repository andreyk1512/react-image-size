const React = require('react');

/**
 * Get dimensions of any image by url
 * @param {string} url
 * @param {Object} [options] options
 * @param {number} [options.timeout] timeout for reject
 * @return {Promise<{ width: number, height: number }>}
 */
function getImageSize(url, options = {}) {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject('Window is not defined');
    }

    if (!url) {
      return reject('Url is not defined');
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

    if (options.timeout) {
      timer = setTimeout(() => reject('Timeout'), options.timeout);
    }
  });
}

/**
 * Custom react hook for getting dimensions of any image by url
 * @param {string} url
 * @param {Object} [options] options
 * @param {number} [options.timeout] timeout for reject
 * @typedef { width: number, height: number } Dimension - Object with width and height of image
 * @typedef {?string} Error - Error
 * @typedef { loading: boolean, error: Error } Other - Object with loading and error parameters
 * @typedef {[?Dimension, Other]} ReturnTuple
 * @return ReturnTuple
 */
function useImageSize(url, options) {
  const [dimensions, setDimensions] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setDimensions(null);

      try {
        const { width, height } = await getImageSize(url, options);

        setDimensions({ width, height });
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [url, options]);

  return [dimensions, { loading, error }];
}

module.exports = {
  getImageSize,
  useImageSize,
};
