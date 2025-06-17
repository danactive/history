// Vitest is ESM, but Jest v29 is Common (CJS) this works for both
import { mkdir, readdir, rename } from 'node:fs/promises'

export { mkdir, readdir, rename }
