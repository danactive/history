import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FormattedMessage } from 'react-intl';

import messages from './messages';

import Link from '../../components/Link';
import ListItem from '../../components/ListItem';
import GenericList from '../../components/GenericList';

export function AdminLandingPage() {
  const applyId = n => ({ ...n, id: n.label });
  const navItems = [
    { label: 'Walk', href: '/admin/walk' },
    { label: 'Resize', href: '/admin/resize' },
  ].map(applyId);

  const ListComponent = ({ item }) => (
    <ListItem item={<Link to={item.href}>{item.label}</Link>} />
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
