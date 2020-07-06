import React from 'react';

import HostStorage from '../Loadable';

export default {
  title: 'HostStorage',
  component: HostStorage,
};

export const Dropbox = () => <HostStorage host="dropbox" />;
export const Local = () => <HostStorage host="local" />;
