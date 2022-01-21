import { useState } from 'react'

const useMemory = (filtered) => {
  const [viewedList, setViewedList] = useState([0])
  const [details, setDetails] = useState(filtered[0])
  const setViewed = (index) => {
    setDetails(filtered[index])
    setViewedList(viewedList.concat(index))
  }

  return {
    setViewed,
    memoryHtml: (
      <>
        <h3>{details && details.city}</h3>
        <h4>{details && details.location}</h4>
      </>
    ),
    viewedList,
  }
}

export default useMemory
