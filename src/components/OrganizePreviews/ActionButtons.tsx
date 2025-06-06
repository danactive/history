import Button from '@mui/joy/Button'
import Textarea from '@mui/joy/Textarea'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

import type { Filesystem } from '../../lib/filesystems'
import type { RenameRequestBody, RenameResponseBody } from '../../lib/rename'

export default function ActionButtons(
  { items }:
  { items: Filesystem[] },
) {
  const [textXml, setTextXml] = useState('')
  const searchParams = useSearchParams()
  const pathQs = searchParams?.get('path') ?? '/'
  async function rename() {
     
    let date = window.prompt('Date of images (YYYY-MM-DD)?')
    if (date === '') date = null
    const today = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date()).replace(/\//g, '-')

    const postBody: RenameRequestBody = {
      dry_run: false,
      filenames: items.map((i) => i.filename),
      prefix: date ?? today,
      source_folder: pathQs,
      rename_associated: true,
    }

    const options = {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(postBody),
    }

    const response = await fetch('/api/admin/rename', options)
    const result: RenameResponseBody = await response.json()
    setTextXml(result.xml)
  }

  return (
    <div>
      <Button onClick={() => rename()}>Rename</Button>
      <Textarea
        disabled={false}
        minRows={2}
        size="sm"
        variant="outlined"
        value={textXml}
      />
    </div>
  )
}
