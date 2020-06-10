import { push } from 'connected-react-router';
import React from 'react';
import { Helmet } from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { compose } from 'redux';

import A from '../../components/A';
import messages from './messages';

export function AdminLandingPage({
  navToWalk,
}) {
  return (
    <div>
      <Helmet>
        <title>Admin</title>
        <meta name="description" content="Admin" />
      </Helmet>
      <h1>
        <FormattedMessage {...messages.header} />
      </h1>
      <ul>
        <li><A onClick={navToWalk}>Walk</A></li>
        <li><A onClick={navToWalk}>Resize</A></li>
      </ul>
    </div>
  );
}

const mapDispatchToProps = (dispatch) => ({
  navToWalk: () => dispatch(push('/admin/walk')),
  navToResize: () => dispatch(push('/admin/resize')),
});

const withConnect = connect(null, mapDispatchToProps);

export default compose(
  withConnect,
)(AdminLandingPage);
