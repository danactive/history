import dynamic from 'next/dynamic'
import type { Metadata } from 'next'

const WalkClient = dynamic(
  () => import('../../../src/components/Walk/WalkClient'),
  { ssr: true },
)
import getFilesystems from '../../../src/lib/filesystems'

export const metadata: Metadata = {
  title: 'Admin > Walk - History App',
}

export default async function Page() {
  const { files } = await getFilesystems('/')
  return <WalkClient files={files} />
}
