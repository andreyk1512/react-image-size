# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Added
- Result caching — repeated `getImageSize` calls with the same URL resolve instantly from a module-level cache
- `clearCache()` export to manually invalidate the cache
- `clearCacheEntry(url)` export to invalidate a single URL in the cache
- Abort support via `AbortSignal` — pass `signal` in options to cancel in-flight requests
- `Error.ABORTED` constant for identifying abort rejections
- `retries` option — automatically retry failed loads with exponential backoff (1s, 2s, 3s…)
- `crossOrigin` option — sets `img.crossOrigin` attribute for CORS images
- `staleTime` option — cache TTL in ms; cached result is re-fetched after it expires
- Request deduplication — concurrent calls for the same URL share a single in-flight `Image` request
- `enabled` option (`useImageSize` only) — skip fetching until `true`, re-fetches when it becomes `true`
- `keepPreviousData` option (`useImageSize` only) — hold previous dimensions while new URL loads, eliminates null flash
- `refetch` in `useImageSize` return value — clears cache entry and re-triggers fetch
- `isPreviousData` in `useImageSize` return value — `true` when dimensions are from the previous URL
- `UseImageSizeOptions` type export — extends `Options` with hook-specific fields
- Bundle size check via `size-limit` (`yarn size`) — enforces ≤ 3 kB

### Changed
- Build migrated from dual `tsc` to `tsup` — outputs `lib/index.js` (CJS) and `lib/index.mjs` (ESM)
- `tsconfig.esm.json` removed — ESM build now handled by tsup
- Added `declarationMap: true` to tsconfig for IDE source navigation

### Fixed
- Image load was not actually cancelled on cleanup — `img.src = ''` is now called via `AbortController` when the hook unmounts or URL changes

## 3.0.0 - 2026-05-07
### Added
- ESM output at `lib/esm/` with `"module"` and `"exports"` fields in `package.json`
- SSR guard in `useImageSize` — early return when `typeof window === 'undefined'`

### Changed
- **BREAKING** Error strings from `useImageSize` no longer include the `Error:` prefix. `error` state now returns `err.message` for Error instances instead of `err.toString()`. Example: `"Image not found"` instead of `"Error: Image not found"`
- **BREAKING** ESM entry point added — bundlers resolving `"exports"` field will now get ESM by default
- Migrated from deprecated `tslint` to ESLint 10 + `@typescript-eslint` + `eslint-plugin-react-hooks`
- Migrated from deprecated `@testing-library/react-hooks` to `@testing-library/react` v16
- Upgraded TypeScript 4 → 6
- Upgraded Jest 29 → 30
- Upgraded React devDeps 16 → 19 (peerDeps unchanged: `>=16.9.0`)
- Upgraded Prettier 2 → 3

### Fixed
- Infinite re-render loop when `options` object passed inline — `timeout` is now extracted as a primitive dep
- State update on unmounted component — `useEffect` now cancels in-flight requests on cleanup
- Unsafe error cast `(error as string).toString()` replaced with proper `instanceof Error` check

## 2.4.0 - 2024-06-14
### Changed
- Reset error when url change

## 2.3.2 - 2023-11-02
### Changed
- Move constants

## 2.3.1 - 2023-11-02
### Changed
- Improve README.md

## 2.3.0 - 2023-11-02
### Added
- Add `react` and `react-dom` to dev dependencies

### Changed
- Rename Changes.md to CHANGELOG.md and Readme.md to README.md

### Removed
- Remove unused scripts in [package.json](package.json)

## 2.2.0 - 2023-11-02
### Added
- Add object with error constants

## 2.1.0 - 2023-11-02
### Added
- Add unit tests
- Add [CHANGELOG.md](CHANGELOG.md) file

### Changed
- Improve tslint
- Improve [tslint.json](tslint.json) configuration
- Update `react` and `react-dom` peer dependencies to `>=16.9.0` version

## 2.0.2 - 2023-03-16
### Changed
- Format [package.json](package.json) file
- Improve [README.md](README.md) doc
- Update `prettier` and `typescript` dev dependencies

### Fixed
- Fix package-lock.json version

## 2.0.1 - 2023-03-14
### Changed
- Improve [tslint.json](tslint.json) config

### Fixed
- Fix example with "reject timer" in the README.md (PR [#6](https://github.com/andreyk1512/react-image-size/pull/6))

## 2.0.0 - 2022-11-26
### Added
- Add `peerDependencies` to [package.json](package.json)
- Add package-lock.json
- Add typescript support
- Add tslint
- Add prettier
- Add `useImageSize` hook

### Changed
- Update [package.json](package.json) meta
- Improve [README.md](README.md)
- Change files structure

## 1.0.6 - 2022-11-26
### Changed
- Update `reactImageSize` response object

### Fixed
- Fix Next.js issue (Issue [#3](https://github.com/andreyk1512/react-image-size/issues/3))

## 1.0.5 - 2022-04-30
### Changed
- Move `reactImageSize` function to `index.js` file
- Update [package.json](package.json) type, files and exports

## 1.0.4 - 2020-11-16
### Added
- Add error message to reject argument

## 1.0.3 - 2020-11-15
### Added
- Add [README.md](README.md) file

## 1.0.2 - 2020-11-15
### Fixed
- Fix default export

## 1.0.1 - 2020-11-15
### Changed
- Change export type
- Rename timeout variable

## 1.0.0 - 2020-11-15
### Added
- Add [LICENSE](LICENSE) file
- Add [package.json](package.json) meta data
- Add `reactImageSize` function
