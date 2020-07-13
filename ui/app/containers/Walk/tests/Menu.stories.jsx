import React from 'react';
import { Provider } from 'react-redux';

import Menu from '../Menu';

import configureStore from '../../../configureStore';

const store = configureStore({});

export default {
  title: 'Menu',
  component: Menu,
};

export const Default = () => (
  <Provider store={store}>
    <Menu />
  </Provider>
);

export const ShowMenu = () => (
  <Provider store={store}>
    <Menu showMenu />
  </Provider>
);
