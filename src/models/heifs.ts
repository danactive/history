import { z } from 'zod/v4-mini'

const requestSchema = z.object({
  files: z.array(z.object({
    filename: z.string('files filename missing property'),
  }), 'files missing property').check(
    z.minLength(1, 'files needs a value'),
  ),
  destinationPath: z.string('destinationPath missing property').check(
    z.trim(),
    z.minLength(1, 'destinationPath needs a value'),
  ),
}, 'JSON object body is expected')

export default requestSchema
