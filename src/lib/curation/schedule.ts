import fs from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { constants } from 'node:fs'
import { inventory } from './sources'

const xml = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
export function launchAgent(root: string, node: string, minute = 15) {
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) throw new Error('Minute must be between 0 and 59')
  if (!root.startsWith('/') || !node.startsWith('/')) throw new Error('Absolute project and Node paths required')
  const args = [node, join(root, 'node_modules/tsx/dist/cli.mjs'), join(root, 'scripts/curation-scan.ts'), '--scheduled']
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>Label</key><string>ca.domaindesign.history.curation</string>
<key>ProgramArguments</key><array>${args.map(value => `<string>${xml(value)}</string>`).join('')}</array>
<key>WorkingDirectory</key><string>${xml(root)}</string>
<key>StartCalendarInterval</key><dict><key>Minute</key><integer>${minute}</integer></dict>
<key>ProcessType</key><string>Background</string>
</dict></plist>
`
}

export async function prepareSchedule(root: string, node: string, minute = 15) {
  root = resolve(root)
  await Promise.all([
    fs.access(node, constants.X_OK), fs.access(join(root, 'node_modules/tsx/dist/cli.mjs')),
    fs.access(join(root, 'scripts/curation-scan.ts')), fs.access(join(root, 'public/galleries'), constants.R_OK),
  ])
  const sources = await inventory(root)
  if (sources.errors.length) throw new Error(sources.errors.join('\n'))
  const directory = join(root, '.history', 'curation')
  await fs.mkdir(directory, { recursive: true, mode: 0o700 })
  await fs.access(directory, constants.W_OK)
  const path = join(directory, 'ca.domaindesign.history.curation.plist')
  await fs.writeFile(path, launchAgent(root, node, minute), { mode: 0o600 })
  return path
}
