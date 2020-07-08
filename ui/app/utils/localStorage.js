const hostKey = 'history-host';

// eslint-disable-next-line no-console
const logError = (...message) => console.error(...message);

export function get(host) {
  try {
    if (localStorage) {
      const json = JSON.parse(localStorage.getItem(hostKey));

      if (json) {
        return json[host];
      }
    }

    return null;
  } catch (e) {
    logError(`Failed to get ${host} to localStorage ${hostKey}`, e);
    return null;
  }
}

export function update(host, value) {
  try {
    if (localStorage) {
      const json = JSON.parse(localStorage.getItem(hostKey)) || {};
      json[host] = value;
      localStorage.setItem(hostKey, JSON.stringify(json));
    }
  } catch (e) {
    const json = { [host]: value };
    localStorage.setItem(hostKey, JSON.stringify(json));
    logError(`Failed to update ${host} to localStorage ${hostKey}`, e);
  }
}

export function remove(host) {
  try {
    if (localStorage) {
      const json = JSON.parse(localStorage.getItem(hostKey));
      delete json[host];
      localStorage.setItem(hostKey, JSON.stringify(json));
    }
  } catch (e) {
    logError(`Failed to remove ${host} from localStorage ${hostKey}`, e);
  }
}
