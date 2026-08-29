import type { Metadata } from 'next'
import { connection } from 'next/server'
import { Suspense } from 'react'

import Link from '../../../src/components/Link'
import getAlbum from '../../../src/lib/album'
import getAlbums from '../../../src/lib/albums'
import {
  auditCriticalTags,
  getConfiguredCriticalTags,
  type CriticalTagAlbum,
} from '../../../src/lib/critical-tags'
import { getAvailableGalleries } from '../../../src/types/generated'
import styles from './styles.module.css'

export const metadata: Metadata = {
  title: 'Admin > Critical Tags - History App',
}

function editAlbumHref({ gallery, album }: CriticalTagAlbum) {
  const params = new URLSearchParams({ gallery, album: album.name })
  return `/admin/album?${params}`
}

function formatMedian(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

export default function CriticalTagsPage() {
  return (
    <main className={styles.page}>
      <h1>Critical-tag coverage</h1>
      <Suspense fallback={<p>Checking album coverage...</p>}>
        <CriticalTagsContent />
      </Suspense>
    </main>
  )
}

async function CriticalTagsContent() {
  await connection()

  const [galleryAlbums, criticalTags] = await Promise.all([
    getAlbums(),
    getConfiguredCriticalTags(),
  ])
  const loadedAlbums = await Promise.all(
    getAvailableGalleries(galleryAlbums).flatMap(gallery => galleryAlbums[gallery].albums.map(async (album) => {
        const { album: loadedAlbum } = await getAlbum(gallery, album.name)
        return {
          gallery,
          album,
          items: loadedAlbum.items,
        }
      })),
  )
  const audit = auditCriticalTags(loadedAlbums, criticalTags)

  return (
    <>
      {audit.criticalTags.length > 0 ? (
        <p>Configured critical tags: {audit.criticalTags.join(', ')}</p>
      ) : (
        <p>No critical tags are configured in config.local.json.</p>
      )}

      <dl className={styles.summary}>
        <div><dt>Albums checked</dt><dd>{audit.albums.length}</dd></div>
        <div><dt>Without critical tags</dt><dd>{audit.albumsWithoutCriticalTags.length}</dd></div>
        <div><dt>Median tagged media / covered album</dt><dd>{formatMedian(audit.medianCriticalMediaCount)}</dd></div>
        <div><dt>Below median</dt><dd>{audit.albumsBelowMedian.length}</dd></div>
      </dl>

      {audit.albumsWithoutCriticalTags.length > 0 ? (
        <section aria-labelledby="untagged-heading">
          <h2 id="untagged-heading">Albums with no critical tags</h2>
          <ul className={styles.untaggedList}>
            {audit.albumsWithoutCriticalTags.map(album => (
              <li key={`${album.gallery}/${album.album.name}`}>
                <Link href={editAlbumHref(album)}>{album.gallery} / {album.album.name} {album.album.h1}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p>Every album has at least one critical-tagged media item.</p>
      )}

      <section aria-labelledby="all-albums-heading">
        <h2 id="all-albums-heading">All albums</h2>
        <p>
          A media item counts once when it has one or more configured critical tags. “Below median” compares covered albums only; missing albums are listed separately above.
        </p>
        <div className={styles.tableScroller}>
          <table>
            <thead>
              <tr>
                <th scope="col">Gallery</th>
                <th scope="col">Album name</th>
                <th scope="col">Heading</th>
                <th scope="col">Critical-tagged media</th>
                <th scope="col">Status</th>
                <th scope="col">Edit</th>
              </tr>
            </thead>
            <tbody>
              {audit.albums.map(album => (
                <tr key={`${album.gallery}/${album.album.name}`}>
                  <td>{album.gallery}</td>
                  <td>{album.album.name}</td>
                  <td>{album.album.h1}</td>
                  <td>{album.criticalMediaCount}</td>
                  <td>
                    {album.criticalMediaCount === 0
                      ? 'Missing critical tags'
                      : album.isBelowMedian
                        ? 'Below median'
                        : 'At or above median'}
                  </td>
                  <td><Link href={editAlbumHref(album)}>Edit album</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
