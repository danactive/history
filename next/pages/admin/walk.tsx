import { List, ListDivider } from '@mui/joy'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import ListFile from '../../src/components/Walk/ListFile'
import type { Filesystem, FilesystemBody } from '../../src/lib/filesystems'
import { isImage, organizeByMedia, parseHash } from '../../src/utils/walk'

type ItemFile = Partial<Filesystem> & {
  id?: Filesystem['path'];
  content?: Filesystem['filename'];
}

function WalkPage() {
  const { asPath } = useRouter()
  const [data, setData] = useState<FilesystemBody | null>(null)
  const [isLoading, setLoading] = useState(false)
  const pathQs = parseHash('path', asPath)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/filesystems?path=${pathQs ?? '/'}`)
      .then((response) => response.json())
      .then((result: FilesystemBody) => {
        setData(result)
        setLoading(false)
      })
  }, [asPath])

  if (isLoading) return <p>Loading...</p>
  if (!data) return <p>No filesystem data</p>

  const itemFiles = data.files.map((file): ItemFile => ({
    id: file.path,
    content: file.filename,
    ...file,
  }))
  const itemImages = itemFiles.filter((file) => isImage(file))
  // eslint-disable-next-line no-console
  console.log('itemImages', itemImages)

  return (
    <List>
      {organizeByMedia(itemFiles).map((item, i) => (
        <>
          {i > 0 && <ListDivider />}
          <ListFile item={item} key={item.id} />
        </>
      ))}
    </List>
  )
}

export { type ItemFile }
export default WalkPage
