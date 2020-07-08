import React, { memo, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { getHostToken, hostCase } from '../../utils/host';
import { remove as removeFromStorage } from '../../utils/localStorage';

import Button from '../Button';
import GenericList from '../GenericList/Loadable';
import H3 from '../H3';
import ListItem from '../ListItem';
import messages from './messages';

function Remove({
  showHeader = true,
  setTokenInStorage = () => {},
  storageUpdated = () => {},
}) {
  const storedHostnames = ['dropbox', 'local'].filter(host =>
    getHostToken(host, 'browser'),
  );

  useEffect(() => {
    if (storedHostnames.length > 0) {
      setTokenInStorage(true);
    }
  });

  function handleRemove(host) {
    removeFromStorage(host);
    storageUpdated(host, null, false);
  }

  const RemoveButtons = ({ item: { host } }) => (
    <ListItem
      item={
        <Button onClick={() => handleRemove(host)}>
          {hostCase(host)}
          <span role="img" aria-label="Delete token" title="Delete token">
            ❌️
          </span>
        </Button>
      }
    />
  );

  return (
    <section>
      {showHeader && (
        <H3>
          <FormattedMessage {...messages.clearHeader} />
        </H3>
      )}
      <GenericList
        loading={false}
        error={false}
        items={storedHostnames.map(host => ({ id: `remove-${host}`, host }))}
        component={RemoveButtons}
      />
    </section>
  );
}

export default memo(Remove);
