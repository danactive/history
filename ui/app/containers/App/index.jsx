import React from 'react';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';
import { Switch, Route } from 'react-router-dom';

import AlbumViewPage from '../AlbumViewPage/Loadable';
import HomePage from '../HomePage/Loadable';
import FeaturePage from '../FeaturePage/Loadable';
import GalleryViewPage from '../GalleryViewPage/Loadable';
import NotFoundPage from '../NotFoundPage/Loadable';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

import GlobalStyle from '../../global-styles';

const AppWrapper = styled.div`
  max-width: calc(768px + 16px * 2);
  margin: 0 auto;
  display: flex;
  min-height: 100%;
  padding: 0 16px;
  flex-direction: column;
`;

export default function App() {
  return (
    <AppWrapper>
      <Helmet
        titleTemplate="%s - History"
        defaultTitle="History"
      />
      <Header />
      <Switch>
        <Route exact path="/" component={HomePage} />
        <Route path="/album/view/:album" component={AlbumViewPage} />
        <Route path="/features" component={FeaturePage} />
        <Route path="/gallery/view/:gallery" component={GalleryViewPage} />
        <Route path="" component={NotFoundPage} />
      </Switch>
      <Footer />
      <GlobalStyle />
    </AppWrapper>
  );
}
