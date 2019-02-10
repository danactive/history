import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';

import getInjectors from './reducerInjectors';

/**
 * Dynamically injects a reducer
 *
 * @param {string} key A key of the reducer
 * @param {function} reducer A reducer that will be injected
 *
 */
export default ({ key, reducer }) => (WrappedComponent) => {
  class ReducerInjector extends React.Component {
    componentWillMount() {
      const { injectReducer } = this.injectors;

      injectReducer(key, reducer);
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  }

  ReducerInjector.injectors = getInjectors(this.context.store);
  ReducerInjector.WrappedComponent = WrappedComponent;
  ReducerInjector.displayName = `withReducer(${WrappedComponent.displayName
  || WrappedComponent.name
  || 'Component'})`;

  return hoistNonReactStatics(ReducerInjector, WrappedComponent);
};
