'use client'

import List from '@mui/joy/List'
import ListDivider from '@mui/joy/ListDivider'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import type { FilesystemResponseBody } from '../../lib/filesystems'
import type { HeifResponseBody } from '../../lib/heifs'
import { Filesystem } from '../../models/filesystems'
import {
  addParentDirectoryNav,
  isImage,
  organizeByMedia,
} from '../../utils/walk'
import OrganizePreviews from '../OrganizePreviews'
import ListFile from './ListFile'

async function getImages(path: string): Promise<Filesystem[]> {
  const response = await fetch(`/api/admin/filesystems?path=${path}`)
  const resultPossibleHeif: FilesystemResponseBody = await response.json()
  const heifResponse = await fetch('/api/admin/heifs', {
    body: JSON.stringify({ files: resultPossibleHeif.files, destinationPath: path }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
  const resultHeif: HeifResponseBody = await heifResponse.json()

  console.log(`Newly created HEIF files ${resultHeif.created.length}`)
  if (resultHeif.created.length > 0) {
    const resultResponse = await fetch(`/api/admin/filesystems?path=${path}`)
    const result: FilesystemResponseBody = await resultResponse.json()
    return result.files
  }
  return resultPossibleHeif.files
}

export default function WalkClient({ files: filesAtLoad }: { files: Filesystem[] }) {
  const [fileList, setFileList] = useState<Filesystem[] | null>(null)
  const [previewList, setPreviewList] = useState<Filesystem[] | null>(null)
  const [isLoading, setLoading] = useState(false)
  const params = useParams<{ path: string[] }>()
  const path = params.path ? `/${params.path.join('/')}` : '/'

  useEffect(() => {
    setLoading(true)
    const fetchData = async () => {
      const files = await getImages(path)
      setLoading(false)
      setFileList(files)
      const itemImages = files.filter((file) => isImage(file))
      setPreviewList(itemImages)
    }
    fetchData()
  }, [])

  if (isLoading) return <p>Generating JPGs...</p>
  if (!fileList) return <p>Loading filesystem data</p>

  const hasImages = !isLoading && previewList && previewList.length > 0
  const fsItems = addParentDirectoryNav(organizeByMedia(fileList), path)

  return (
    <>
      <List>
        {fsItems.map((item, i) => (
          // TODO something starting Next.js v15 started to add HTML attribute to Fragment with browser errors
          <span key={item.id}>
            {i > 0 && <ListDivider />}
            <ListFile item={item} route='/admin/walk' />
          </span>
        ))}
      </List>
      {hasImages && (
        <OrganizePreviews setItems={setPreviewList} items={previewList} />
      )}
    </>
  )
}
