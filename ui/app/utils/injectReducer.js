import React from "react";
import PropTypes from "prop-types";
import hoistNonReactStatics from "hoist-non-react-statics";

import getInjectors from "./reducerInjectors";

/**
 * Dynamically injects a reducer
 *
 * @param {string} key A key of the reducer
 * @param {function} reducer A reducer that will be injected
 *
 */
export default ({ key, reducer }) => WrappedComponent => {
  class ReducerInjector extends React.Component {
    constructor(...args) {
      var _temp;

      return (
        (_temp = super(...args)),
          (this.injectors = getInjectors(this.context.store)),
          _temp
      );
    }

    componentWillMount() {
      const { injectReducer } = this.injectors;

      injectReducer(key, reducer);
    }

    render() {
      return React.createElement(WrappedComponent, this.props);
    }
  }

  ReducerInjector.WrappedComponent = WrappedComponent;
  ReducerInjector.contextTypes = {
    store: PropTypes.object.isRequired
  };
  ReducerInjector.displayName = `withReducer(${WrappedComponent.displayName ||
  WrappedComponent.name ||
  "Component"})`;
  return hoistNonReactStatics(ReducerInjector, WrappedComponent);
};
