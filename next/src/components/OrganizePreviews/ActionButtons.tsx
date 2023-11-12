import Button from '@mui/joy/Button'
import { useRouter } from 'next/router'

import type { Filesystem } from '../../lib/filesystems'
import { parseHash } from '../../utils/walk'

export default function ActionButtons(
  { items }:
  { items: Filesystem[] },
) {
  const { asPath } = useRouter()
  const pathQs = parseHash('path', asPath)
  const path = pathQs ?? '/'
  function rename() {
    // eslint-disable-next-line no-alert
    const date = window.prompt('Date of images (YYYY-MM-DD)?')
    // TODO POST http://localhost:8000/admin/rename

    const postBody = {
      filenames: items.map((i) => i.filename),
      prefix: date,
      source_folder: path,
      preview: false,
      raw: true,
      rename_associated: true,
    }

    const options = {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(postBody),
    }
    /*
    curl -d '{"filenames":["a.jpg","b.jpg"], "prefix": "2020-06-13",
    "source_folder": "/todo/doit", "preview": "false", "raw": "true", "rename_associated": "true"}'
    -i http://127.0.0.1:8000/admin/rename  -H "Content-Type: application/json"
    */

    return fetch('/api/admin/rename', options).then((s) => console.log(s))
  }

  return <div><Button onClick={() => rename()}>Rename</Button></div>
}
