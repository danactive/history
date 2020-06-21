import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage } from 'react-intl';

import messages from './messages';

import A from '../../components/A';
import ListItem from '../../components/ListItem';
import GenericList from '../../components/GenericList';

export function AdminLandingPage() {
  const applyId = n => ({ ...n, id: n.label });
  const navItems = [
    { label: 'Walk', href: '/admin/walk' },
    { label: 'Resize', href: '/admin/resize' },
  ].map(applyId);

  // TODO danactive change href to onChange to be SPA and decrease page loads
  const ListComponent = ({ item }) => (
    <ListItem item={<A href={item.href}>{item.label}</A>} />
  );

  return (
    <div>
      <Helmet>
        <title>Walk - Admin</title>
        <meta name="description" content="Admin" />
      </Helmet>
      <h1>
        <FormattedMessage {...messages.header} />
      </h1>
      <GenericList
        items={navItems}
        error={false}
        loading={false}
        component={ListComponent}
      />
    </div>
  );
}

export default AdminLandingPage;
