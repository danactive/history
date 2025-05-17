import { z } from 'zod/v4-mini'

const requestSchema = z.object({
  files: z.string('files missing property').check(
    z.trim(),
    z.minLength(1, 'files needs a value')
  ),
  destinationPath: z.string('destinationPath missing property').check(
    z.trim(),
    z.minLength(1, 'destinationPath needs a value')
  ),
})

export default requestSchema
