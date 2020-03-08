import React from 'react';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';
import { Switch, Route } from 'react-router-dom';

import AdminLandingPage from '../AdminLandingPage/Loadable';
import AlbumViewPage from '../AlbumViewPage/Loadable';
import ExploreVideo from '../ExploreVideo';
import HomePage from '../HomePage/Loadable';
import GalleryViewPage from '../GalleryViewPage/Loadable';
import NotFoundPage from '../NotFoundPage/Loadable';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Walk from '../Walk/Loadable';

import GlobalStyle from '../../global-styles';

const AppWrapper = styled.div`
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
      >
        <meta name="description" content="History" />
      </Helmet>
      <Header />
      <Switch>
        <Route exact path="/" component={HomePage} />
        <Route exact path="/admin" component={AdminLandingPage} />
        <Route exact path="/admin/walk" component={Walk} />
        <Route path="/explore" component={ExploreVideo} />
        <Route path="/view/:host/:gallery/:album" component={AlbumViewPage} />
        <Route path="/view/:host/:gallery" component={GalleryViewPage} />
        <Route path="" component={NotFoundPage} />
      </Switch>
      <Footer />
      <GlobalStyle />
    </AppWrapper>
  );
}
