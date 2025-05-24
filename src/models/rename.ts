import { z } from 'zod/v4-mini'

const requestSchema = z.object({
  source_folder: z.string('source_folder missing property2').check(
    z.trim(),
    z.minLength(1, 'source_folder needs a value'),
  ),
  filenames: z.array(z.string('filenames is an array of strings'), 'filenames missing property').check(
    z.minLength(1, 'filenames needs a value'),
  ),
}, 'JSON object body is expected')

function validateRequestBody(body: z.infer<typeof requestSchema>) {
  requestSchema.parse(body || {})
  return {
    sourceFolder: body.source_folder,
    filenames: body.filenames,
  }
}

export { validateRequestBody }
export default requestSchema
