import React from 'react';
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
  makeSelectGalleries,
  makeSelectGalleryLoading,
  makeSelectGalleryError,
} from './selectors';
import reducer from './reducer';
import saga from './saga';

export class HomePage extends React.PureComponent {
  componentWillMount() {
    const { onLoad } = this.props;
    onLoad();
  }

  render() {
    const {
      galleries,
      galleryError,
      galleryLoading,
    } = this.props;

    const galleryListProps = {
      loading: galleryLoading,
      error: galleryError,
      items: galleries,
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
}

export function mapDispatchToProps(dispatch) {
  return {
    onLoad: () => dispatch(loadGalleries()),
  };
}

const mapStateToProps = createStructuredSelector({
  galleries: makeSelectGalleries(),
  galleryLoading: makeSelectGalleryLoading(),
  galleryError: makeSelectGalleryError(),
});

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

const withReducer = injectReducer({ key: 'mediaGallery', reducer });
const withSaga = injectSaga({ key: 'mediaGallery', saga });

export default compose(
  withReducer,
  withSaga,
  withConnect,
)(HomePage);
