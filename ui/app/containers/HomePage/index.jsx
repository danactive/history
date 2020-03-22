import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';

import injectReducer from '../../utils/injectReducer';
import injectSaga from '../../utils/injectSaga';
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

export function HomePage({
  galleryErrors,
  galleryLoading,
  items,
  onLoad,
}) {
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
      <div>
        <CenteredSection>
          <H2>
            <FormattedMessage {...messages.galleriesHeader} />
          </H2>
          <GenericList {...galleryListProps} />
        </CenteredSection>
      </div>
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

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

const withReducer = injectReducer({ key: 'homePage', reducer });
const withSaga = injectSaga({ key: 'homePage', saga });

export default compose(
  withReducer,
  withSaga,
  withConnect,
)(HomePage);
