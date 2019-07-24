import addons from '@storybook/addons';
import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import withReduxEnhancer from 'addon-redux/enhancer';
import produce from 'immer';
import withRedux from 'addon-redux/withRedux';
import React from 'react';
import { Provider } from 'react-redux';

import configureStore from '../../../configureStore';
import InfiniteThumbs from '..';

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
      hasMore: false,
      page: 1,
    },
    albums: {
      gallery: 'demo',
      album: 'sample',
      currentMemory: {
        filename: '2001-03-21-01.jpg',
        id: 1,
      },
      demo: {
        sample: {
          memories: [
            {
              id: 1,
              filename: '2001-03-21-01.jpg',
            },
            {
              id: 2,
              filename: '2004-01-04-01.jpg',
            },
            {
              id: 3,
              filename: '2005-07-30-01.jpg',
            },
            {
              id: 4,
              filename: '2012-fireplace.jpg',
            },
            {
              id: 5,
              filename: '2014-02-08-14.jpg',
            },
          ],
        },
      },
    },
  },
};

const withReduxSettings = {
  Provider,
  store,
  state,
  actions: [
    {
      name: 'real',
      action: {
        type: 'app/InfiniteThumbs/CHOOSE_MEMORY',
        id: 1,
      },
    },
    {
      name: 'Loading done',
      action: {
        type: 'blah',
        dan: 2,
        mediaGallery: {
          albumViewPage: {
            thumbsError: false,
          },
        },
      },
    },
    {
      name: 'Loading',
      action: {
        type: 'blah2',
        mediaGallery: {
          albumViewPage: {
            thumbsError: true,
            dan: 1,
          },
        },
      },
    },
  ],
};

const withReduxDecorator = withRedux(addons)(withReduxSettings);

const props = {
  error: false,
  loading: true,
  hasMore: true,
  items: [
    {
      id: 1,
      filename: '2001-03-21-01.jpg',
    },
    {
      id: 2,
      filename: '2004-01-04-01.jpg',
    },
    {
      id: 3,
      filename: '2005-07-30-01.jpg',
    },
    {
      id: 4,
      filename: '2012-fireplace',
    },
    {
      id: 5,
      filename: '2014-02-08-14.jpg',
    },
  ],
};

storiesOf('InfiniteThumbs', module)
  .addDecorator(withReduxDecorator)
  .add('Default', () => <InfiniteThumbs />)
  .add('Loading', () => <InfiniteThumbs {...props} />)
  .add('Many thumbs', () => {
    /* eslint-disable no-param-reassign */
    const newProps = produce(props, (draftState) => {
      draftState.loading = false;
    });

    return (
      <div style={{
        width: 200,
        height: 80,
        'overflow-y': 'auto',
        background: 'red',
      }}
      >
        <InfiniteThumbs {...newProps} />
      </div>
    );
  })
;
