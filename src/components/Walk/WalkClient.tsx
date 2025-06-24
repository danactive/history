'use client'

import { List, ListDivider } from '@mui/joy'
import { useSearchParams } from 'next/navigation'
import { Fragment, useEffect, useState } from 'react'

import OrganizePreviews from '../OrganizePreviews'
import ListFile from './ListFile'
import type { Filesystem, FilesystemResponseBody } from '../../lib/filesystems'
import type { HeifResponseBody } from '../../lib/heifs'
import {
  addParentDirectoryNav,
  isImage,
  organizeByMedia,
} from '../../utils/walk'

async function getImages(pathQs: string): Promise<Filesystem[]> {
  const response = await fetch(`/api/admin/filesystems?path=${pathQs}`)
  const resultPossibleHeif: FilesystemResponseBody = await response.json()
  const heifResponse = await fetch('/api/admin/heifs', {
    body: JSON.stringify({ files: resultPossibleHeif.files, destinationPath: pathQs }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  const resultHeif: HeifResponseBody = await heifResponse.json()

  console.log(`Newly created HEIF files ${resultHeif.created.length}`)
  if (resultHeif.created.length > 0) {
    const resultResponse = await fetch(`/api/admin/filesystems?path=${pathQs}`)
    const result: FilesystemResponseBody = await resultResponse.json()
    return result.files
  }
  return resultPossibleHeif.files
}

export default function WalkClient() {
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

  if (isLoading) return <p>Loading filesystem and generating JPGs...</p>
  if (!fileList) return <p>No filesystem data</p>

  const hasImages = !isLoading && previewList && previewList.length > 0
  const fsItems = addParentDirectoryNav(organizeByMedia(fileList), pathQs)

  return (
    <>
      <List>
        {fsItems.map((item, i) => (
          // TODO something starting Next.js v15 started to add HTML attribute to Fragment with browser errors
          <span key={item.id}>
            {i > 0 && <ListDivider />}
            <ListFile item={item} />
          </span>
        ))}
      </List>
      {hasImages && (
        <OrganizePreviews setItems={setPreviewList} items={previewList} />
      )}
    </>
  )
}
