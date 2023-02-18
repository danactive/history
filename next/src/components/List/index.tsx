import React from 'react'

import Ul from './Ul'
import Wrapper from './Wrapper'

type ItemWithId = {
  id: string;
}

function List(
  { component: ComponentToRender, items }:
  { component: React.FC<{item?: ItemWithId}>; items?: ItemWithId[]; },
) {
  let content

  // If we have items, render them
  if (items) {
    content = (
      <>
        {items.map((item) => (
          <ComponentToRender key={`item-${item.id}`} item={item} />
        ))}
      </>
    )
  } else {
    // Otherwise render a single component
    content = <ComponentToRender />
  }

  return (
    <Wrapper>
      <Ul>{content}</Ul>
    </Wrapper>
  )
}

export default List
