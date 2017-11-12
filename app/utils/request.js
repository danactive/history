import 'whatwg-fetch';

/**
 * Parses if network response returned is JSON then parse otherwise return raw
 *
 * @param  {object} response A response from a network request
 *
 * @return {object}          The parsed JSON, or raw other type from the request
 */
function parseResponse(response) {
  if (response.status === 204 || response.status === 205) {
    return null;
  }

  if (response.headers.get('Content-Type') === 'application/xml') {
    return response.text();
  }

  return response.json();
}

// Convert text to XML document or return response
function parseAgain(response) {
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

  const error = new Error(response.statusText);
  error.response = response;
  throw error;
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
  return fetch(url, options)
    .then(checkStatus)
    .then(parseResponse)
    .then(parseAgain);
}
