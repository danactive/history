import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import ListItem from '../../components/ListItem';
import { capitalize } from '../../utils/strings';
import { hostCase } from '../../utils/host';

const LLink = styled(Link)`
  color: #6cc0e5;
`;

function GalleryListItem({ item: { name: gallery, host, id } }) {
  const content = [
    <LLink key={`gallery-content-item-${id}`} to={`/view/${host}/${gallery}`}>
      {capitalize(gallery)}
    </LLink>,
    `(${hostCase(host)})`,
  ];

  return <ListItem key={`gallery-list-item-${id}`} item={content} />;
}

export default GalleryListItem;
