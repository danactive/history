import { useEffect, useState } from 'react'
import styled from 'styled-components'

import Link from '../components/Link'

const City = styled.h3`
  display: inline;
  margin-right: 1rem;
`
const Location = styled.h4`
  display: inline;
  margin-right: 1rem;
`
interface Viewed {
  (index: number): void; // eslint-disable-line
}
const useMemory = (filtered, refImageGallery) => {
  const [viewedList, setViewedList] = useState(new Set<string>())
  const [details, setDetails] = useState(filtered[0])

  const setViewed = (index: number) => {
    setDetails(filtered[index] ?? filtered[0]) // applying filter may reduce the filtered items, so show default item details
    setViewedList(new Set([...viewedList, filtered[index]?.id ?? filtered[index]?.filename]))
  }
  useEffect(() => {
    setViewed(refImageGallery.current.getCurrentIndex())
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
