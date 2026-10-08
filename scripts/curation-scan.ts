import { parseArgs } from 'node:util'
import { resolve } from 'node:path'
import { enqueue, runScan, scanStatus } from '../src/lib/curation/engine'
import { identifier } from '../src/lib/curation/model'

const { values } = parseArgs({ options: {
  root: { type: 'string' }, full: { type: 'boolean' }, scheduled: { type: 'boolean' },
  status: { type: 'boolean' }, consume: { type: 'boolean' }, gallery: { type: 'string' }, album: { type: 'string' },
} })
const root = resolve(values.root ?? process.cwd())
if (values.status) {
  console.log(JSON.stringify(await scanStatus(root), null, 2))
} else {
  if (values.gallery || values.album) {
    await enqueue(root, 'incremental', `${identifier.parse(values.gallery)}/${identifier.parse(values.album)}`)
  }
  console.log(JSON.stringify(await runScan(root, values.full ? 'full' : values.scheduled ? 'scheduled' : 'incremental')))
  const status = await scanStatus(root)
  if (status.state === 'incomplete' || status.state === 'failed') {
    console.error(status.errors.join('\n'))
    process.exitCode = 1
  }
}
