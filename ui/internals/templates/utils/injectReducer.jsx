import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import getInjectors from './reducerInjectors';

function defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  } else {
    obj[key] = value; // eslint-disable-line no-param-reassign
  }
  return obj;
}

/**
 * Dynamically injects a reducer
 *
 * @param {string} key A key of the reducer
 * @param {function} reducer A reducer that will be injected
 *
 */

export default ({ key, reducer }) => (WrappedComponent) => {
  class ReducerInjector extends React.Component {
    constructor(...args) {
      super(...args);

      const { store } = this.context;

      defineProperty(this, 'injectors', getInjectors(store));
    }

    componentWillMount() {
      const { injectReducer } = this.injectors;
      injectReducer(key, reducer);
    }

    render() {
      return React.createElement(WrappedComponent, this.props);
    }
  }

  defineProperty(ReducerInjector, 'WrappedComponent', WrappedComponent);

  defineProperty(ReducerInjector, 'contextTypes', {
    store: () => {},
  });

  defineProperty(
    ReducerInjector,
    'displayName',
    `withReducer(${WrappedComponent.displayName
    || WrappedComponent.name
    || 'Component'})`,
  );

  return hoistNonReactStatics(ReducerInjector, WrappedComponent);
};
