import React from 'react';
import { Helmet } from 'react-helmet-async';
import { hot } from 'react-hot-loader/root';
import { Switch, Route } from 'react-router-dom';
import styled from 'styled-components';

import AdminLandingPage from '../AdminLandingPage/Loadable';
import AlbumViewPage from '../AlbumViewPage/Loadable';
import ExploreVideo from '../ExploreVideo';
import Footer from '../../components/Footer';
import GalleryViewPage from '../GalleryViewPage/Loadable';
import Header from '../../components/Header';
import HomePage from '../HomePage/Loadable';
import NearbyPage from '../NearbyPage/Loadable';
import NotFoundPage from '../NotFoundPage/Loadable';
import ResizePage from '../admin/ResizePage/Loadable';
import Walk from '../Walk/Loadable';

import GlobalStyle from '../../global-styles';

const AppWrapper = styled.main`
  background-color: #323232;
  margin: 0 auto;
  display: flex;
  min-height: 100%;
  padding: 0 16px;
  flex-direction: column;
`;

function App() {
  return (
    <AppWrapper>
      <Helmet titleTemplate="%s - History" defaultTitle="History">
        <meta name="description" content="History" />
      </Helmet>
      <Header />
      <Switch>
        <Route exact path="/" component={HomePage} />
        <Route exact path="/admin" component={AdminLandingPage} />
        <Route exact path="/admin/walk" component={Walk} />
        <Route exact path="/admin/resize" component={ResizePage} />
        <Route path="/explore" component={ExploreVideo} />
        <Route path="/nearby" component={NearbyPage} />
        <Route path="/view/:host/:gallery/:album" component={AlbumViewPage} />
        <Route path="/view/:host/:gallery" component={GalleryViewPage} />
        <Route path="" component={NotFoundPage} />
      </Switch>
      <Footer />
      <GlobalStyle />
    </AppWrapper>
  );
}

export default hot(App);
