'use client'

import { List, ListDivider } from '@mui/joy'
import { useSearchParams } from 'next/navigation'
import { Fragment, useEffect, useState } from 'react'

import OrganizePreviews from '../../../src/components/OrganizePreviews'
import ListFile from '../../../src/components/Walk/ListFile'
import type { Filesystem, FilesystemResponseBody } from '../../../src/lib/filesystems'
import type { HeifResponseBody } from '../../../src/lib/heifs'
import {
  addParentDirectoryNav,
  isImage,
  organizeByMedia,
} from '../../../src/utils/walk'

async function getImages(pathQs: string): Promise<Filesystem[]> {
  const response = await fetch(`/api/admin/filesystems?path=${pathQs}`)
  const resultPossibleHeif: FilesystemResponseBody = await response.json()
  const heifResponse = await fetch('/api/admin/heifs', {
    body: JSON.stringify({ files: resultPossibleHeif.files, destinationPath: pathQs }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  const resultHeif: HeifResponseBody = await heifResponse.json()
  // eslint-disable-next-line no-console
  console.log(`Newly created HEIF files ${resultHeif.created.length}`)
  if (resultHeif.created.length > 0) {
    const resultResponse = await fetch(`/api/admin/filesystems?path=${pathQs}`)
    const result: FilesystemResponseBody = await resultResponse.json()
    return result.files
  }
  return resultPossibleHeif.files
}

function WalkPage() {
  const searchParams = useSearchParams()
  const [fileList, setFileList] = useState<Filesystem[] | null>(null)
  const [previewList, setPreviewList] = useState<Filesystem[] | null>(null)
  const [isLoading, setLoading] = useState(false)
  const pathQs = searchParams?.get('path') ?? '/'

  useEffect(() => {
    if (pathQs) {
      setLoading(true)
      const fetchData = async () => {
        const files = await getImages(pathQs)
        setLoading(false)
        setFileList(files)
        const itemImages = files.filter((file) => isImage(file))
        setPreviewList(itemImages)
      }
      fetchData()
    }
  }, [pathQs])

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

export default WalkPage
