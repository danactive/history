import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useInjectReducer, useInjectSaga } from 'redux-injectors';

import H2 from '../../components/H2';
import GenericList from '../../components/GenericList';
import GalleryListItem from '../GalleryListItem/index';
import CenteredSection from './CenteredSection';

import { loadGalleries } from './actions';
import messages from './messages';
import {
  selectItems,
  selectGalleryLoading,
  selectGalleryErrors,
  selectMissingHosts,
} from './selectors';
import reducer from './reducer';
import saga from './saga';

export function HomePage() {
  const dispatch = useDispatch();
  useInjectReducer({ key: 'homePage', reducer });
  useInjectSaga({ key: 'homePage', saga });

  const items = useSelector(selectItems);
  const galleryLoading = useSelector(selectGalleryLoading);
  const galleryErrors = useSelector(selectGalleryErrors);
  const missingHosts = useSelector(selectMissingHosts);

  useEffect(() => {
    dispatch(loadGalleries());
  }, []);

  if (galleryLoading) {
    console.log(missingHosts);
  }

  return (
    <article>
      <Helmet>
        <title>View Galleries</title>
      </Helmet>
      <CenteredSection>
        <H2>
          <FormattedMessage {...messages.galleriesHeader} />
        </H2>
        <GenericList
          loading={galleryLoading}
          error={galleryErrors}
          items={items}
          component={GalleryListItem}
        />
      </CenteredSection>
    </article>
  );
}

export default HomePage;
