import Button from '@mui/joy/Button'
import Textarea from '@mui/joy/Textarea'
import { useRouter } from 'next/router'
import { useState } from 'react'

import type { Filesystem } from '../../lib/filesystems'
import type { RenameResponseBody, RenameRequestBody } from '../../lib/rename'
import { parseHash } from '../../utils/walk'

export default function ActionButtons(
  { items }:
  { items: Filesystem[] },
) {
  const [textXml, setTextXml] = useState('')
  const { asPath } = useRouter()
  const pathQs = parseHash('path', asPath)
  async function rename() {
    // eslint-disable-next-line no-alert
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
