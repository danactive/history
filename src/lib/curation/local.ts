export function localCurationEnabled() {
  const enabled = process.env.HISTORY_LOCAL_ADMIN === 'true'
  return enabled && !process.env.VERCEL && !process.env.CF_PAGES
}

export function requireLocalRequest(request: Request) {
  if (!localCurationEnabled()) throw new Error('Local curation is not enabled')
  const url = new URL(request.url)
  if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) throw new Error('Local host required')
  if (request.headers.get('host') && request.headers.get('host') !== url.host) throw new Error('Host mismatch')
  const origin = request.headers.get('origin')
  if (origin && origin !== url.origin) throw new Error('Cross-origin request rejected')
  if (request.headers.get('sec-fetch-site') === 'cross-site') throw new Error('Cross-site request rejected')
}
