import { List, ListDivider, ListItem } from '@mui/joy'
import { useRouter } from 'next/router'
import { Fragment, useEffect, useState } from 'react'

import ListFile from '../../src/components/Walk/ListFile'
import type { Filesystem, FilesystemBody } from '../../src/lib/filesystems'
import {
  addParentDirectoryNav,
  isImage,
  organizeByMedia,
  parseHash,
} from '../../src/utils/walk'

type ItemFile = Partial<Filesystem> & {
  id: Filesystem['id'];
  path: Filesystem['path'];
  label: string;
  grouped?: string;
  flat?: string;
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

  const itemImages = data.files.filter((file) => isImage(file))
  const hasImages = !isLoading && itemImages.length > 0
  const fsItems = addParentDirectoryNav(organizeByMedia(data.files), pathQs)

  return (
    <>
      <List>
        {fsItems.map((item, i) => (
          <Fragment key={item.id}>
            {i > 0 && <ListDivider />}
            <ListFile item={item} />
          </Fragment>
        ))}
      </List>
      {hasImages && (<div>TODO display OrganizeThumbs</div>)}
    </>
  )
}

export { type ItemFile }
export default WalkPage
