import React from 'react';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { compose } from 'redux';


export function AdminLandingPage() {
  return (
    <div>
      <Helmet>
        <title>Admin</title>
        <meta name="description" content="Admin" />
      </Helmet>
      <h1>Admin</h1>
    </div>
  );
}


function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

const withConnect = connect(null, mapDispatchToProps);

export default compose(
  withConnect,
)(AdminLandingPage);
