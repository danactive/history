import { parseArgs } from 'node:util'
import { resolve } from 'node:path'
import { prepareSchedule } from '../src/lib/curation/schedule'

const { values } = parseArgs({ options: { root: { type: 'string' }, minute: { type: 'string' } } })
const path = await prepareSchedule(resolve(values.root ?? process.cwd()), process.execPath, Number(values.minute ?? 15))
console.log(`Prepared ${path}\nNo agent was installed. See docs/curation-inbox.md for setup and uninstall commands.`)
