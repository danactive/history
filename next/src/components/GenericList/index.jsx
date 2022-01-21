import List from '../List'
import ListItem from '../ListItem'
import LoadingIndicator from '../LoadingIndicator'

function getErrorComponent({ message }) {
  return (
    <ListItem
      item={`Something went wrong, please try again! Reason (${message})`}
    />
  )
}

function GenericList({
  component,
  items,
  loading,
  error,
}) {
  if (loading) {
    return <List component={LoadingIndicator} />
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
