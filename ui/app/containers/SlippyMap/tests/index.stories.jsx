import addons from '@storybook/addons';
import { storiesOf } from '@storybook/react';
import withReduxEnhancer from 'addon-redux/enhancer';
import withRedux from 'addon-redux/withRedux';
import produce from 'immer';
import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import SlippyMap from '..';

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
  currentMemory: {
    coordinates: [-123.1, 49.25],
  },
};

storiesOf('SlippyMap', module)
  .addDecorator(withReduxDecorator)
  .add('Default', () => <SlippyMap />)
  .add('with Vancouver centre', () => (
    <div
      style={{
        width: 600,
        height: 600,
      }}
    >
      <SlippyMap {...props} />
    </div>
  ))
  .add('with Vancouver centre with pin', () => {
    /* eslint-disable no-param-reassign */
    const newProps = produce(props, (draftState) => {
      draftState.items = [{ coordinates: props.currentMemory.coordinates }];
    });

    return (
      <div
        style={{
          width: 600,
          height: 600,
        }}
      >
        <SlippyMap {...newProps} />
      </div>
    );
  })
  .add('with Vancouver centre zoomed out with pin', () => {
    /* eslint-disable no-param-reassign */
    const newProps = produce(props, (draftState) => {
      draftState.currentMemory.coordinateAccuracy = 14;
      draftState.items = [{ coordinates: props.currentMemory.coordinates }];
    });

    return (
      <div
        style={{
          width: 600,
          height: 600,
        }}
      >
        <SlippyMap {...newProps} />
      </div>
    );
  })
  .add('with Vancouver centre zoomed out with pin as circle', () => {
    /* eslint-disable no-param-reassign */
    const newProps = produce(props, (draftState) => {
      draftState.currentMemory.coordinateAccuracy = 14;
      draftState.items = [{ coordinates: props.currentMemory.coordinates, coordinateAccuracy: 17 }];
    });

    return (
      <div
        style={{
          width: 600,
          height: 600,
        }}
      >
        <SlippyMap {...newProps} />
      </div>
    );
  });
