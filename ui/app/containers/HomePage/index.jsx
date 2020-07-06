import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useInjectReducer, useInjectSaga } from 'redux-injectors';

import CenteredSection from './CenteredSection';
import GalleryListItem from '../GalleryListItem/index';
import GenericList from '../../components/GenericList';
import H2 from '../../components/H2';
import HostStorage from '../../components/HostStorage';

import { loadGalleries, storeToken } from './actions';
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

  const dispatchEventOnStore = (name, value) =>
    dispatch(storeToken(name, value));

  const storageOptions =
    !galleryLoading &&
    missingHosts.map(host => (
      <HostStorage
        key={`host-storage-${host}`}
        host={host}
        dispatchEventOnStore={dispatchEventOnStore}
      />
    ));

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
        {storageOptions}
      </CenteredSection>
    </article>
  );
}

export default HomePage;
