import type { Metadata } from 'next'

import WalkClient from '../../../src/components/Walk/WalkClient'
import getFilesystems from '../../../src/lib/filesystems'

export const metadata: Metadata = {
  title: 'Admin > Walk - History App',
}

export default async function Page() {
  const { files } = await getFilesystems('/')
  return <WalkClient files={files} />
}
