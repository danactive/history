import addons from '@storybook/addons';
import { storiesOf } from '@storybook/react';
import withReduxEnhancer from 'addon-redux/enhancer';
import withRedux from 'addon-redux/withRedux';
import produce from 'immer';
import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import SlippyPhoto from '..';
import photo from '../../../../../public/galleries/gallery-demo/media/photos/2014/2014-02-08-14.jpg';
import thumb from '../../../../../public/galleries/gallery-demo/media/thumbs/2014/2014-02-08-14.jpg';

const reducer = () => {};
const store = createStore(reducer, withReduxEnhancer);
const state = {};

const withReduxSettings = {
  Provider,
  store,
  state,
};

const withReduxDecorator = withRedux(addons)(withReduxSettings);

const props = {
  currentMemory: {},
};

storiesOf('SlippyPhoto', module)
  .addDecorator(withReduxDecorator)
  .add('Default', () => <SlippyPhoto />)
  .add('with thumbnail', () => {
    /* eslint-disable no-param-reassign */
    const newProps = produce(props, (draftState) => {
      draftState.currentMemory.thumbLink = thumb;
    });

    return (
      <div
        style={{
          width: 185,
          height: 45,
        }}
      >
        <SlippyPhoto {...newProps} />
      </div>
    );
  })
  .add('with photo', () => {
    /* eslint-disable no-param-reassign */
    const newProps = produce(props, (draftState) => {
      draftState.currentMemory.photoLink = photo;
    });

    return (
      <div
        style={{
          width: 600,
          height: 600,
        }}
      >
        <SlippyPhoto {...newProps} />
      </div>
    );
  })
  .add('with thumbnail & photo', () => {
    /* eslint-disable no-param-reassign */
    const newProps = produce(props, (draftState) => {
      draftState.currentMemory.photoLink = photo;
      draftState.currentMemory.thumbLink = thumb;
    });

    return (
      <div
        style={{
          width: 600,
          height: 600,
        }}
      >
        <SlippyPhoto {...newProps} />
      </div>
    );
  });
