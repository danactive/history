/** Encode a slash-delimited path without treating filename characters as URL syntax. */
export function encodePathSegments(value: string) {
  return value.split('/').map(encodeURIComponent).join('/')
}
