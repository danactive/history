import List from '../List'
import ListItem from '../ListItem'
import LoadingIndicator from '../LoadingIndicator'

function GenericList({
  component, items, loading, error,
}) {
  if (loading) {
    return <List component={LoadingIndicator} />
  }

  if (error !== false) {
    const ErrorComponent = () => (
      <ListItem
        item={`Something went wrong, please try again! Reason (${error.message})`}
      />
    )
    return <List component={ErrorComponent} />
  }

  if (items?.length > 0) {
    return <List items={items} component={component} />
  }

  return null
}

export default GenericList
