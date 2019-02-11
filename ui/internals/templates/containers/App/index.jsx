/* eslint-disable import/no-named-as-default, import/no-named-as-default-member */

import React from 'react';
import { Switch, Route } from 'react-router-dom';

import HomePage from '../../../../app/containers/HomePage/Loadable';
import NotFoundPage from '../../../../app/containers/NotFoundPage/Loadable';

import GlobalStyle from '../../global-styles';

export default function App() {
  return (
    <div>
      <Switch>
        <Route exact path="/" component={HomePage} />
        <Route component={NotFoundPage} />
      </Switch>
      <GlobalStyle />
    </div>
  );
}
