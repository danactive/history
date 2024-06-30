import { List, ListDivider } from '@mui/joy'
import { useRouter } from 'next/router'
import {
  Fragment, useEffect, useRef, useState,
} from 'react'

import OrganizePreviews from '../../src/components/OrganizePreviews'
import ListFile from '../../src/components/Walk/ListFile'
import type { Filesystem, FilesystemBody } from '../../src/lib/filesystems'
import type { HeifBody } from '../../src/lib/heifs'
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
  const lastFetchedPath = useRef('')

  useEffect(() => {
    if (asPath !== lastFetchedPath.current) {
      setLoading(true)
      const fetchData = async () => {
        const response = await fetch(`/api/admin/filesystems?path=${pathQs}`)
        const resultPossibleHeif: FilesystemBody = await response.json()
        const heifResponse = await fetch('/api/admin/heifs', {
          body: JSON.stringify({ files: resultPossibleHeif.files, destinationPath: pathQs }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        })
        const resultHeif: HeifBody = await heifResponse.json()
        // eslint-disable-next-line no-console
        console.log(`Newly created HEIF files ${resultHeif.created.length}`)
        const resultResponse = await fetch(`/api/admin/filesystems?path=${pathQs}`)
        const result: FilesystemBody = await resultResponse.json()
        setLoading(false)
        setFileList(result.files)
        const itemImages = result.files.filter((file) => isImage(file))
        setPreviewList(itemImages)
      }
      fetchData()
      lastFetchedPath.current = asPath
    }
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
