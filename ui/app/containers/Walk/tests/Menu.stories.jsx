import React from 'react';

import Menu from '../Menu';

export default {
  title: 'Menu',
  component: Menu,
};

export const Default = () => (
  <Menu />
);

export const ShowMenu = () => (
  <Menu showMenu />
);
