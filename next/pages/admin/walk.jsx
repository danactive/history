import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import GenericList from '../../src/components/GenericList'
import ListFile from '../../src/components/Walk/ListFile'

import { isImage, parseHash, organizeByMedia } from '../../src/utils/walk'

function WalkPage() {
  const { asPath } = useRouter()
  const [data, setData] = useState(null)
  const [isLoading, setLoading] = useState(false)
  const pathQs = parseHash('path', asPath)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/filesystems?path=${pathQs ?? '/'}`)
      .then((response) => response.json())
      .then((result) => {
        setData(result)
        setLoading(false)
      })
  }, [asPath])

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
