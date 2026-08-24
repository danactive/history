import Button from '@mui/joy/Button'
import Textarea from '@mui/joy/Textarea'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'

import type { Filesystem } from '../../lib/filesystems'
import type { RenameRequestBody, RenameResponseBody } from '../../lib/rename'
import type { ResizeRequestBody } from '../../lib/resize'
import { encodePathSegments } from '../../utils/url-path'

type ResizeError = {
  count?: number
  message?: string[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object'
}

function getResizeError(value: unknown): ResizeError | undefined {
  if (!isRecord(value) || !isRecord(value.meta) || !isRecord(value.meta.error)) return undefined

  const { count, message } = value.meta.error
  const error: ResizeError = {}
  if (typeof count === 'number') error.count = count
  if (Array.isArray(message) && message.every(entry => typeof entry === 'string')) {
    error.message = message
  }
  return error
}

export default function ActionButtons(
  { items }:
  { items: Filesystem[] },
) {
  const [textXml, setTextXml] = useState('')
  const [resizeError, setResizeError] = useState('')
  const [isResizing, setIsResizing] = useState(false)
  const params = useParams<{ path: string[] }>()
  const router = useRouter()
  const path = params.path ? `/${params.path.join('/')}` : '/'

  async function rename() {
    const input = window.prompt('Date (YYYY-MM-DD)? Blank=today. YYYY-MM-DD-ID=exact.')
    if (input === null) return

    const today = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date()).replace(/\//g, '-')

    const prefix = input.trim() === '' ? today : input.trim()

    const postBody: RenameRequestBody = {
      dry_run: false,
      filenames: items.map((i) => i.filename),
      prefix,
      source_folder: path,
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

  async function resize() {
    setIsResizing(true)
    setResizeError('')
    const postBody: ResizeRequestBody = {
      source_folder: path,
      get_metadata: false,
    }

    const options = {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(postBody),
    }

    try {
      const response = await fetch('/api/admin/resize', options)
      const result = await response.json()
      const errors = getResizeError(result)
      if (!response.ok || (errors?.count ?? 0) > 0) {
        throw new Error(errors?.message?.join(' ') || 'Could not resize photos')
      }
      router.push(`/admin/thumbs${encodePathSegments(path)}`)
    } catch (error) {
      setResizeError(error instanceof Error ? error.message : 'Could not resize photos')
    } finally {
      setIsResizing(false)
    }
  }

  return (
    <div>
      <Button color='neutral' onClick={() => rename()}>Rename</Button>
      <Button color='neutral' onClick={() => resize()} loading={isResizing}>
        Resize &amp; frame thumbs
      </Button>
      {resizeError && <p>{resizeError}</p>}
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
