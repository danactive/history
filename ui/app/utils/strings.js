// *********** HISTORY CUSTOM not React Boilerplate

export const capitalize = words =>
  words.replace(/(?:^|\s)\S/g, a => a.toUpperCase());

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
