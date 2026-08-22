type MapErrorLike = {
  message?: unknown;
  url?: unknown;
}

function isMapErrorLike(error: unknown): error is MapErrorLike {
  return error !== null && typeof error === 'object'
}

/**
 * Mapbox emits recoverable tile request failures through the map's error event.
 * react-map-gl logs every unhandled map error with console.error, which turns a
 * transient third-party network failure into a Next.js application overlay.
 */
export function isTransientMapboxNetworkError(error: unknown) {
  const message = isMapErrorLike(error) && typeof error.message === 'string'
    ? error.message
    : typeof error === 'string'
      ? error
      : ''
  const url = isMapErrorLike(error) && typeof error.url === 'string' ? error.url : ''
  const details = `${message} ${url}`

  const isNetworkFailure = /NetworkError when attempting to fetch resource|Failed to fetch|Load failed/i.test(details)
  const isMapboxRequest = /https:\/\/api\.mapbox\.com\//i.test(details)

  return isNetworkFailure && isMapboxRequest
}
