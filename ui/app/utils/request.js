/* global fetch, window */
/**
 * Parses the JSON returned by a network request
 *
 * @param  {object} response A response from a network request
 *
 * @return {object}          The parsed JSON from the request
 */
function parseJSON(response) {
  if (response.status === 204 || response.status === 205) {
    return null;
  }

  // *********** HISTORY CUSTOM not React Boilerplate
  if (response.headers.get('Content-Type').includes('application/xml')
    || response.headers.get('Content-Type').includes('text/xml')) {
    return response.text();
  }

  return response.json();
}

// *********** HISTORY CUSTOM not React Boilerplate
// Convert text to XML document or return response
export function parseTextXml(response) {
  if (typeof response === 'string') {
    return (new window.DOMParser()).parseFromString(response, 'text/xml');
  }

  return response;
}

/**
 * Checks if a network request came back fine, and throws an error if not
 *
 * @param  {object} response   A response from a network request
 *
 * @return {object|undefined} Returns either the response, or throws an error
 */
function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const error = new Error(response.message || response.statusText);
  error.response = response;
  throw error;
}

// *********** HISTORY CUSTOM not React Boilerplate
/**
 * Object to querystring
 * @param {string} rawUrl
 * @param {object|Array<Array>} params - example {lat:35.696233, long:139.570431} or [['lat', '35.696233'], ['long', '139.570431']]
 */
export function querystring(rawUrl, params) {
  const url = new URL(rawUrl);
  url.search = new URLSearchParams(params).toString();
  return url.toString();
}

// *********** HISTORY CUSTOM not React Boilerplate
function fetchWithTimeout(url, options, wait = 1700) {
  let timerId;
  const timeout = new Promise((_, reject) => {
    timerId = setTimeout(() => {
      clearTimeout(timerId);
      reject(new Error(`XHR timeout (${timeout}) to ${url}`))
    }, wait)
  })

  return Promise.race([
    fetch(url, options)
      .then((response) => {
        clearTimeout(timerId);
        return response;
      }),
    timeout,
  ]);
}

/**
 * Requests a URL, returning a promise
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 *
 * @return {object}           The response data
 */
export default function request(url, options) {
  return fetchWithTimeout(url, options)
    .then(checkStatus) // *********** HISTORY CUSTOM modified React Boilerplate
    .then(parseJSON)
    .then(parseTextXml); // *********** HISTORY CUSTOM not React Boilerplate
}
