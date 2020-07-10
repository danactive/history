// *********** HISTORY CUSTOM not React Boilerplate
import { apiPort as port } from '../../../config.json';
import { get as getFromStorage } from './localStorage';

/**
 * Get host token/path value
 * @param {('cdn'|'dropbox')} host
 * @param {('browser')} [storageType=null]
 */
export function getHostToken(host, storageType = null) {
  if (host === 'dropbox') {
    const envValue = process.env.HISTORY_DROPBOX_ACCESS_TOKEN;
    if (envValue && storageType !== 'browser') {
      return envValue;
    }

    const hostValue = getFromStorage('dropbox');
    if (hostValue) {
      return hostValue;
    }

    return undefined;
  }

  if (host === 'cdn') {
    const hostValue = getFromStorage('cdn');
    if (hostValue) {
      return hostValue;
    }

    if (storageType !== 'browser') {
      return `http://localhost:${port}`;
    }
  }

  return null;
}

export const hostCase = host => {
  switch (host) {
    case 'dropbox':
      return 'Dropbox';
    case 'cdn':
      return 'CDN';
    default:
  }
  return '';
};

export const hostIndex = host => {
  switch (host) {
    case 'dropbox':
      return 1;
    case 'cdn':
      return 0;
    default:
  }
  return -1;
};
