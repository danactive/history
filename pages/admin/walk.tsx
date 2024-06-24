import { List, ListDivider } from '@mui/joy'
import { useRouter } from 'next/router'
import { Fragment, useEffect, useState } from 'react'

import OrganizePreviews from '../../src/components/OrganizePreviews'
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
  const [fileList, setFileList] = useState<Filesystem[] | null>(null)
  const [previewList, setPreviewList] = useState<Filesystem[] | null>(null)
  const [isLoading, setLoading] = useState(false)
  const pathQs = parseHash('path', asPath)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/filesystems?path=${pathQs}`)
      .then((response) => response.json())
      .then((result: FilesystemBody) => {
        setLoading(false)
        setFileList(result.files)
        const itemImages = result.files.filter((file) => isImage(file))
        setPreviewList(itemImages)
      })
  }, [asPath])

  if (isLoading) return <p>Loading...</p>
  if (!fileList) return <p>No filesystem data</p>

  const hasImages = !isLoading && previewList && previewList.length > 0
  const fsItems = addParentDirectoryNav(organizeByMedia(fileList), pathQs)

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
      {hasImages && (
        <OrganizePreviews setItems={setPreviewList} items={previewList} />
      )}
    </>
  )
}

export { type ItemFile }
export default WalkPage
