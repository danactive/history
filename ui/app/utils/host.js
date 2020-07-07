// *********** HISTORY CUSTOM not React Boilerplate
import { apiPort as port } from '../../../config.json';
import { get as getFromStorage } from './localStorage';

/**
 * Get host token/path value
 * @param {('local'|'dropbox')} host
 * @param {('browser')} [storageType=null]
 */
export function getHostToken(host, storageType = null) {
  if (host === 'dropbox') {
    const envValue = process.env.HISTORY_DROPBOX_ACCESS_TOKEN;
    if (envValue && storageType !== 'browser') {
      return envValue;
    }

    const localValue = getFromStorage('dropbox');
    if (localValue) {
      return localValue;
    }

    return undefined;
  }

  if (host === 'local') {
    const localValue = getFromStorage('local');
    if (storageType === 'browser') {
      return localValue;
    }

    return `http://localhost:${port}`;
  }

  return null;
}

export const hostCase = host => {
  switch (host) {
    case 'dropbox':
      return 'Dropbox';
    case 'local':
      return 'CDN';
    default:
  }
  return '';
};

export const hostIndex = host => {
  switch (host) {
    case 'dropbox':
      return 1;
    case 'local':
      return 0;
    default:
  }
  return -1;
};
