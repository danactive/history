import { useEffect, useState } from 'react'

import Link from '../components/Link'

const useMemory = (filtered, refImageGallery) => {
  const [viewedList, setViewedList] = useState([0])
  const [details, setDetails] = useState(filtered[0])
  const setViewed = (index) => {
    setDetails(filtered[index])
    setViewedList(viewedList.concat(index))
  }
  useEffect(() => {
    setViewed(refImageGallery.current.getCurrentIndex())
  }, [filtered[0]])

  const memoryHtml = details ? (
    <>
      <h3>{details.city}</h3>
      <h4>{details.location}</h4>
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
