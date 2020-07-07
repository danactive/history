import { defineMessages } from 'react-intl';

export const scope = 'app.components.HostStorage';

export default defineMessages({
  clearHeader: {
    id: `${scope}.clearHeader`,
    defaultMessage: 'Clear tokens from browser storage',
  },
  instruction: {
    id: `${scope}.instruction`,
    defaultMessage: '{host} token for loading photo gallery',
  },
  saveButton: {
    id: `${scope}.saveButton`,
    defaultMessage: 'Save in browser',
  },
});
