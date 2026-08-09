type MapErrorLike = {
  message?: unknown;
  url?: unknown;
}

/**
 * Mapbox emits recoverable tile request failures through the map's error event.
 * react-map-gl logs every unhandled map error with console.error, which turns a
 * transient third-party network failure into a Next.js application overlay.
 */
export function isTransientMapboxNetworkError(error: unknown) {
  const errorLike = error as MapErrorLike | null
  const message = typeof errorLike?.message === 'string'
    ? errorLike.message
    : typeof error === 'string'
      ? error
      : ''
  const url = typeof errorLike?.url === 'string' ? errorLike.url : ''
  const details = `${message} ${url}`

  const isNetworkFailure = /NetworkError when attempting to fetch resource|Failed to fetch|Load failed/i.test(details)
  const isMapboxRequest = /https:\/\/api\.mapbox\.com\//i.test(details)

  return isNetworkFailure && isMapboxRequest
}
