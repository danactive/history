import React from 'react';

import HostStorage from '../Loadable';

export default {
  title: 'HostStorage',
  component: HostStorage,
};

export const Default = () => <HostStorage host="local" />;
