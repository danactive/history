import React, { lazy, Suspense } from 'react'

const loadable = (importFunc, { fallback = null } = { fallback: null }) => {
  const LazyComponent = lazy(importFunc)

  return (props) => (
    <Suspense fallback={fallback}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <LazyComponent {...props} />
    </Suspense>
  )
}

export default loadable
