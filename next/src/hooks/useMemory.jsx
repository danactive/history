import { useState } from 'react'

import Link from '../components/Link'

const useMemory = (filtered) => {
  const [viewedList, setViewedList] = useState([0])
  const [details, setDetails] = useState(filtered[0])
  const setViewed = (index) => {
    setDetails(filtered[index])
    setViewedList(viewedList.concat(index))
  }

  const memoryHtml = details ? (
    <>
      <h3>{details.city}</h3>
      <h4>{details.location}</h4>
      {details.reference && <Link href={details.reference[0]}>{details.reference[1]}</Link>}
    </>
  ) : null

  return {
    setViewed,
    memoryHtml,
    viewedList,
  }
}

export default useMemory
