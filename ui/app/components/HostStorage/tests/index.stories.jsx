import React, { useState } from 'react';

import HostStorage from '../Loadable';
import Remove from '../Remove';

export default {
  title: 'HostStorage',
  component: HostStorage,
};

export const Dropbox = () => <HostStorage host="dropbox" />;
export const Cdn = () => <HostStorage host="cdn" />;
export const RemoveHosts = () => {
  const [isTokenInStorage, setTokenInStorage] = useState(false);

  return (
    <Remove
      showHeader={isTokenInStorage}
      setTokenInStorage={setTokenInStorage}
      storageUpdated={(host, value, isAdded) => setTokenInStorage(isAdded)}
    />
  );
};
