import { useEffect, useState } from 'react'

import GenericList from '../../src/components/GenericList'
import ListFile from '../../src/components/Walk/ListFile'

import { isImage, organizeByMedia } from '../../src/utils/walk'

function WalkPage() {
  const [data, setData] = useState(null)
  const [isLoading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch('/api/admin/filesystems')
      .then((res) => res.json())
      .then((fetchedData) => {
        setData(fetchedData)
        setLoading(false)
      })
  }, [])

  if (isLoading) return <p>Loading...</p>
  if (!data) return <p>No filesystem data</p>

  const itemFiles = data.files.map((file) => ({
    id: file.path,
    content: file.filename,
    ...file,
  }))
  const itemImages = itemFiles.filter((file) => isImage(file))
  console.log('itemImages', itemImages)

  return (
    <GenericList
      component={ListFile}
      items={organizeByMedia(itemFiles)}
      loading={isLoading}
      error={false}
    />
  )
}

export default WalkPage
