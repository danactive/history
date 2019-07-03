import addons from '@storybook/addons';
import { storiesOf } from '@storybook/react';
import withReduxEnhancer from 'addon-redux/enhancer';
import withRedux from 'addon-redux/withRedux';
import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import AlbumListItem from '..';

const reducer = () => {};
const store = createStore(reducer, withReduxEnhancer);
const state = { mediaGallery: { gallery: 'demo' } };

const withReduxSettings = {
  Provider,
  store,
  state,
};

const withReduxDecorator = withRedux(addons)(withReduxSettings);

const props = {
  item: {
    name: 'sample',
    id: 0,
  },
};

storiesOf('AlbumListItem', module)
  .addDecorator(withReduxDecorator)
  .addDecorator(story => (
    <Router history={createMemoryHistory('/')}>
      <Route path="/" component={() => story()} />
    </Router>
  ))
  .add('Default', () => <AlbumListItem />)
  .add('Item', () => <AlbumListItem {...props} />);
