import React, { useState } from 'react';

import OrganizePreviews, { DraggableThumb } from '../index';

import photo2001 from '../../../../../public/galleries/demo/media/photos/2001/2001-03-21-01.jpg';
import photo2004 from '../../../../../public/galleries/demo/media/photos/2004/2004-01-04-01.jpg';
import photo2005 from '../../../../../public/galleries/demo/media/photos/2005/2005-07-30-01.jpg';
import walkUtils from '../../../containers/Walk/util';
import { storybookPort } from '../../../../../config.json';

const { generateImageFilenames } = walkUtils;

export default {
  title: 'OrganizePreviews',
  component: OrganizePreviews,
};

export const WithText = () => {
  // fake data generator
  function getItems(count) {
    return [...Array(count).keys()].map(k => ({
      id: `item-${k}`,
      content: `item ${k + 1}`,
    }));
  }
  const [items, setItems] = useState(getItems(7));

  return <OrganizePreviews items={items} setItems={setItems} />;
};

export const WithFilenames = () => {
  const [items, setItems] = useState(generateImageFilenames(8, 'rawdoc'));

  return <OrganizePreviews items={items} setItems={setItems} />;
};

export const WithThumbnails = () => {
  const [items, setItems] = useState([
    {
      id: '1',
      content: (
        <DraggableThumb
          item={{ filename: photo2001 }}
          rootFolder={`http://localhost:${storybookPort}/`}
        />
      ),
    },
    {
      id: '2',
      content: (
        <DraggableThumb
          item={{ filename: photo2004 }}
          rootFolder={`http://localhost:${storybookPort}/`}
        />
      ),
    },
    {
      id: '3',
      content: (
        <DraggableThumb
          item={{ filename: photo2005 }}
          rootFolder={`http://localhost:${storybookPort}/`}
        />
      ),
    },
  ]);

  return <OrganizePreviews items={items} setItems={setItems} />;
};
