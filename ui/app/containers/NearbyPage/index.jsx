import React, { memo } from 'react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage } from 'react-intl';

import messages from './messages';

/**
 * Parse querystring from route
 * @param {string} find query name
 * @param {string} from route or URL
 * @returns {string}
 */
function parseQueryString(find, from) {
  if (!find || !from) return '';
  const parts = RegExp(`[?&]${find}(=([^&#]*)|&|#|$)`).exec(from);
  return parts ? parts[2] : '';
}

// location is provided by react-router-dom
function NearbyPage({ location: { search: query } }) {
  const coordinates = parseQueryString('coordinates', query);

  return (
    <article>
      <Helmet>
        <title>Nearby</title>
        <meta name="description" content="Description of Nearby" />
      </Helmet>
      <FormattedMessage {...messages.header} />
      {coordinates}
    </article>
  );
}

export default memo(NearbyPage);
