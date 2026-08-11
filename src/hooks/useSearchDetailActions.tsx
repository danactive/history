'use client'

import { Stack } from '@mui/joy'
import { useMemo } from 'react'
import Link from '../components/Link'
import type { Gallery } from '../types/common'
import { resolveUniquePersonName } from '../utils/person-search'

type PersonSearchItem = {
  persons?: Array<{ full: string }> | null
  search?: string | null
}

export default function useSearchDetailActions<ItemType extends PersonSearchItem>({
  gallery,
  items,
  keyword,
  personDetailsName,
  trailingAction,
}: {
  gallery: Gallery
  items: ItemType[]
  keyword: string
  personDetailsName?: string | null
  trailingAction?: React.ReactNode
}) {
  const resolvedPersonDetailsName = useMemo(() => {
    if (personDetailsName) return personDetailsName
    if (!gallery || !keyword) return null
    return resolveUniquePersonName(items, keyword)
  }, [gallery, items, keyword, personDetailsName])

  const personDetailsHref = gallery && resolvedPersonDetailsName
    ? `/${gallery}/persons/details?${new URLSearchParams({ person: resolvedPersonDetailsName }).toString()}`
    : null

  const detailActions = personDetailsHref || trailingAction
    ? (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          {personDetailsHref ? <Link href={personDetailsHref}>Person details</Link> : null}
          {trailingAction}
        </Stack>
      )
    : null

  return {
    detailActions,
    personDetailsHref,
    resolvedPersonDetailsName,
  }
}
