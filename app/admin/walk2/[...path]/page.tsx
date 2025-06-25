import type { Metadata } from 'next'

import getFilesystems from '../../../../src/lib/filesystems'
import type { Filesystem } from '../../../../src/models/filesystems'
import Link from '../../../../src/components/Link'

export const metadata: Metadata = {
  title: 'Admin > Walk - History App',
}

export const dynamicParams = false

export async function generateStaticParams() {
  const allPaths = await getAllFolderPaths()
  return allPaths.map(path => ({
    path: path.split('/').filter(Boolean), // split into array, remove empty for catch-all segments
  }))
}

async function getAllFolderPaths(path = '/') {
  const { files } = await getFilesystems(path)
  let paths: string[] = []
  for (const file of files) {
    if (file.mediumType === 'folder') {
      const folderPath = path === '/' ? file.name : `${path}/${file.name}`
      paths.push(folderPath)
      // Recursively collect subfolders
      const subPaths = await getAllFolderPaths(folderPath)
      paths = paths.concat(subPaths)
    }
  }
  return paths
}

export default async function Page({
  params,
}: {
  params: Promise<{ path?: string[] }>
}) {
  const { path: pathArray = [] } = await params
  const path = pathArray.join('/')
  const { files } = await getFilesystems(path ? `/${path}` : '/')
  return (
    <>
      <p>name |{path}|</p>
      <ul>
        {files.map((file) => (
          <li key={file.filename}>
            {file.mediumType === 'folder' && <Link href={`/admin/walk2/${path ? `${path}/` : ''}${file.filename}`}>{file.filename}</Link>}
            {file.mediumType !== 'folder' && file.filename}
          </li>
        ))}
      </ul>
    </>
  )
}
