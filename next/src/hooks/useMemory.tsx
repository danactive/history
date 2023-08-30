import { RefObject, useEffect, useState } from 'react'
import type ReactImageGallery from 'react-image-gallery'
import styled from 'styled-components'

import Link from '../components/Link'
import type { Item } from '../types/common'

const City = styled.h3`
  display: inline;
  margin-right: 1rem;
`
const Location = styled.h4`
  display: inline;
  margin-right: 1rem;
`
interface Viewed {
  (index: number): void;
}
const useMemory = (
  filtered: Item[],
  refImageGallery: RefObject<ReactImageGallery>,
) => {
  const [viewedList, setViewedList] = useState(new Set<string>())
  const [details, setDetails] = useState(filtered[0])

  const setViewed = (index: number) => {
    setDetails(filtered[index] ?? filtered[0]) // applying filter may reduce the filtered items, so show default item details
    setViewedList(new Set([...viewedList, filtered[index]?.id ?? filtered[index]?.filename]))
  }
  useEffect(() => {
    if (refImageGallery.current) {
      setViewed(refImageGallery.current.getCurrentIndex())
    }
  }, [filtered[0]])

  const memoryHtml = details ? (
    <>
      <City>{details.title}</City>
      <Location>{details.filename}</Location>
      {details.reference && <Link href={details.reference[0]}>{decodeURI(details.reference[1]).replaceAll('_', ' ')}</Link>}
    </>
  ) : null

  return {
    setViewed,
    memoryHtml,
    viewedList,
  }
}

export default useMemory
export { type Viewed }
