import { apiPort as port } from '../../../config.json';

export function getHostToken(host) {
  if (host === 'dropbox') {
    const envValue = process.env.HISTORY_DROPBOX_ACCESS_TOKEN;
    if (envValue) {
      return envValue;
    }

    const localValue = localStorage.getItem('host-dropbox');
    if (localValue) {
      return localValue;
    }

    return undefined;
  }

  return null;
}

export function getHostPath(host) {
  if (host === 'local') {
    const localValue = localStorage.getItem('host-local');
    if (localValue) {
      return localValue;
    }

    return `http://localhost:${port}`;
  }

  return null;
}
