import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useInjectReducer, useInjectSaga } from 'redux-injectors';

import CenteredSection from './CenteredSection';
import GalleryListItem from '../GalleryListItem/index';
import GenericList from '../../components/GenericList';
import H2 from '../../components/H2';
import HostStorage from '../../components/HostStorage';
import RemoveHostStorage from '../../components/HostStorage/Remove';

import { loadGalleries, tokenStorage } from './actions';
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

  const [isTokenInStorage, setTokenInStorage] = useState(false);

  useEffect(() => {
    dispatch(loadGalleries());
  }, [isTokenInStorage]);

  const storageUpdated = (name, value, isAdded = true) => {
    setTokenInStorage(isAdded);
    dispatch(tokenStorage(name, value, isAdded));
  };

  const storageOptions =
    !galleryLoading &&
    missingHosts.map(host => (
      <HostStorage
        key={`host-storage-${host}`}
        host={host}
        storageUpdated={storageUpdated}
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
        <RemoveHostStorage
          showHeader={isTokenInStorage}
          setTokenInStorage={setTokenInStorage}
          storageUpdated={storageUpdated}
        />
      </CenteredSection>
    </article>
  );
}

export default HomePage;
