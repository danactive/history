import addons from '@storybook/addons';
import { storiesOf } from '@storybook/react';
import withReduxEnhancer from 'addon-redux/enhancer';
import produce from 'immer';
import withRedux from 'addon-redux/withRedux';
import React from 'react';
import { Provider } from 'react-redux';

import configureStore from '../../../configureStore';
import InfiniteThumbs from '..';
import thumb1 from '../../../../../public/galleries/gallery-demo/media/thumbs/2001/2001-03-21-01.jpg';
import thumb2 from '../../../../../public/galleries/gallery-demo/media/thumbs/2004/2004-01-04-01.jpg';

const createEnhancer = () => {
  const enhancers = [];

  if (process.env.NODE_ENV !== 'production') {
    enhancers.push(withReduxEnhancer);
  }

  return enhancers;
};

const store = configureStore({}, null, createEnhancer())
const state = {
  mediaGallery: {
    albumViewPage: {
      thumbsError: false,
    },
  },
};

const withReduxSettings = {
  Provider,
  store,
  state,
};

const withReduxDecorator = withRedux(addons)(withReduxSettings);

const props = {
  error: false,
  loading: true,
  items: [{
    id: 1,
    filename: '2001-03-21-01.jpg',
    thumbLink: thumb1,
  }],
};

storiesOf('InfiniteThumbs', module)
  .addDecorator(withReduxDecorator)
  .add('Default', () => <InfiniteThumbs />)
  .add('Loading', () => <InfiniteThumbs {...props} />)
  .add('One thumb with error', () => {
    /* eslint-disable no-param-reassign */
    const newProps = produce(props, (draftState) => {
      draftState.loading = false;
    });

    return (<InfiniteThumbs {...newProps} />);
  })
  .add('One thumb', () => {
    /* eslint-disable no-param-reassign */
    const newProps = produce(props, (draftState) => {
      draftState.loading = false;
    });

    return (<InfiniteThumbs {...newProps} />);
  })
;
