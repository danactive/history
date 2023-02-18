import React from 'react'

import List from '../List'
import ListItem from '../ListItem'
import LoadingIndicator from '../LoadingIndicator'

type ItemWithId = {
  id: string;
}

interface ErrorObject {
  message: string;
}

function getErrorComponent({ message }: ErrorObject) {
  return (
    <ListItem
      item={`Something went wrong, please try again! Reason (${message})`}
    />
  )
}

function GenericList<ErrorGeneric extends boolean = false>({
  component,
  items,
  loading,
  error,
}: {
  component: React.FC;
  items: ItemWithId[];
  loading: boolean;
  error: ErrorGeneric extends false ? false : ErrorObject;
}) {
  if (loading) {
    return <List component={<LoadingIndicator />} />
  }

  if (error !== false) {
    return <List component={getErrorComponent(error)} />
  }

  if (items?.length > 0) {
    return <List items={items} component={component} />
  }

  return null
}

export default GenericList
