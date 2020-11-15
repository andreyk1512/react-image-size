# react-image-size

A JavaScript module to get size (dimensions) of any image file by url

## Programmatic Usage

```shell
npm install react-image-size --save
```

or

```shell
yarn add react-image-size
```

### Async/Await
```javascript
import reactImageSize from 'react-image-size';

try {
  const { width, height } = await reactImageSize(imageUrl);
  ...
} catch {
  ...
}
```

### Using promises
```javascript
import reactImageSize from 'react-image-size';

reactImageSize(imageUrl)
  .then(({ width, height }) => ...)
  .catch(() => ...);
```

### With reject timer
```javascript
import reactImageSize from 'react-image-size';

const rejectTimeout = 5000; // ms

try {
  const { width, height } = await reactImageSize(imageUrl, rejectTimeout);
  ...
} catch {
  // if request takes longer than 5 seconds an exception will be thrown
}
```
