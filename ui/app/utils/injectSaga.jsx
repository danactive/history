import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { ReactReduxContext } from 'react-redux';

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

import getInjectors from './sagaInjectors';

/**
 * Dynamically injects a saga, passes component's props as saga arguments
 *
 * @param {string} key A key of the saga
 * @param {function} saga A root saga that will be injected
 * @param {string} [mode] By default (constants.DAEMON) the saga will be started
 * on component mount and never canceled or started again. Another two options:
 *   - constants.RESTART_ON_REMOUNT — the saga will be started on component mount and
 *   cancelled with `task.cancel()` on component unmount for improved performance,
 *   - constants.ONCE_TILL_UNMOUNT — behaves like 'RESTART_ON_REMOUNT' but never runs it again.
 *
 */
export default (({
  key,
  saga,
  mode,
}) => (WrappedComponent) => {
  class InjectSaga extends React.Component {
    constructor(props, context) {
      super(props, context);
      this.injectors = getInjectors(context.store);
      this.injectors.injectSaga(key, {
        saga,
        mode,
      }, this.props);
    }

    componentWillUnmount() {
      this.injectors.ejectSaga(key);
    }

    render() {
      return React.createElement(WrappedComponent, this.props);
    }

  }

  defineProperty(InjectSaga, 'WrappedComponent', WrappedComponent);

  defineProperty(InjectSaga, 'contextType', ReactReduxContext);

  defineProperty(
    InjectSaga,
    'displayName',
    `withSaga(${WrappedComponent.displayName
    || WrappedComponent.name
    || 'Component'})`,
  );

  return hoistNonReactStatics(InjectSaga, WrappedComponent);
});

const useInjectSaga = ({
  key,
  saga,
  mode,
}) => {
  const context = React.useContext(ReactReduxContext);
  React.useEffect(() => {
    const injectors = getInjectors(context.store);
    injectors.injectSaga(key, {
      saga,
      mode
    });
    return () => {
      injectors.ejectSaga(key);
    };
  }, []);
};

export { useInjectSaga };
