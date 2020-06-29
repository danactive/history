import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { useInjectReducer, useInjectSaga } from 'redux-injectors';
import { createStructuredSelector } from 'reselect';

import H2 from '../../components/H2';
import GenericList from '../../components/GenericList';
import GalleryListItem from '../GalleryListItem/index';
import CenteredSection from './CenteredSection';
import messages from './messages';

import { loadGalleries } from './actions';
import {
  makeSelectItems,
  makeSelectGalleryLoading,
  makeSelectGalleryErrors,
} from './selectors';
import reducer from './reducer';
import saga from './saga';

export function HomePage({ galleryErrors, galleryLoading, items, onLoad }) {
  useInjectReducer({ key: 'homePage', reducer });
  useInjectSaga({ key: 'homePage', saga });
  useEffect(() => {
    onLoad();
  }, []);

  const galleryListProps = {
    loading: galleryLoading,
    error: galleryErrors,
    items,
    component: GalleryListItem,
  };

  return (
    <article>
      <Helmet>
        <title>View Galleries</title>
      </Helmet>
      <CenteredSection>
        <H2>
          <FormattedMessage {...messages.galleriesHeader} />
        </H2>
        <GenericList {...galleryListProps} />
      </CenteredSection>
    </article>
  );
}

export function mapDispatchToProps(dispatch) {
  return {
    onLoad: () => dispatch(loadGalleries()),
  };
}

const mapStateToProps = createStructuredSelector({
  items: makeSelectItems(),
  galleryLoading: makeSelectGalleryLoading(),
  galleryErrors: makeSelectGalleryErrors(),
});

const withConnect = connect(mapStateToProps, mapDispatchToProps);

export default compose(withConnect)(HomePage);
