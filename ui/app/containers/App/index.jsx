import React from 'react';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';
import { Switch, Route } from 'react-router-dom';

import AlbumViewPage from '../AlbumViewPage/Loadable';
import HomePage from '../HomePage/Loadable.jsx';
import FeaturePage from '../FeaturePage/Loadable';
import GalleryViewPage from '../GalleryViewPage/Loadable';
import NotFoundPage from '../NotFoundPage/Loadable';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const AppWrapper = styled.div`
  margin: 0 auto;
  display: flex;
  min-height: 100%;
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
    </AppWrapper>
  );
}
