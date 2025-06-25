import type { Metadata } from 'next'

import getFilesystems from '../../../src/lib/filesystems'
import Link from '../../../src/components/Link'

export const metadata: Metadata = {
  title: 'Admin > Walk2 - History App',
}

export default async function Page() {
  const { files } = await getFilesystems('/')
  return (
    <>
      <ul>
        {files.map((file) => (
          <li key={file.name}>
            <Link href={`/admin/walk2/${file.name}`}>{file.name}</Link>
          </li>
        ))}
      </ul>
    </>
  )
}
