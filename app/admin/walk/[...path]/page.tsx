import type { Metadata } from 'next'

import WalkClient from '../../../../src/components/Walk/WalkClient'
import getFilesystems from '../../../../src/lib/filesystems'
import type { Walk } from '../../../../src/types/pages'

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

export default async function Page({ params }: { params: Promise<Walk.Params> }) {
  const { path: nextRoutePath = [] } = await params
  const path = nextRoutePath.join('/')
  const fsPath = path ? `/${path}` : '/'
  const { files } = await getFilesystems(fsPath)

  return <WalkClient files={files} />
}
