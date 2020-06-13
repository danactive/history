import React from 'react';
import { Helmet } from 'react-helmet';
import { FormattedMessage } from 'react-intl';

import A from '../../components/A';
import messages from './messages';

export function AdminLandingPage() {
  return (
    <div>
      <Helmet>
        <title>Walk - Admin</title>
        <meta name="description" content="Admin" />
      </Helmet>
      <h1>
        <FormattedMessage {...messages.header} />
      </h1>
      <ul>
        <li><A href="/admin/walk">Walk</A></li>
        <li><A href="/admin/resize">Resize</A></li>
      </ul>
    </div>
  );
}

export default AdminLandingPage;
