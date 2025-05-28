import { z } from 'zod/v4-mini'

const requestSchema = z.object({
  dry_run: z.boolean('dry_run missing bool property'),
  filenames: z.array(z.string('filenames is an array of strings'), 'filenames missing property').check(
    z.minLength(1, 'filenames needs a value'),
  ),
  prefix: z.string('prefix missing property'),
  source_folder: z.string('source_folder missing property').check(
    z.trim(),
    z.minLength(1, 'source_folder needs a value'),
  ),
}, 'JSON object body is expected')

type RequestSchema = z.infer<typeof requestSchema>

function validateRequestBody(body: RequestSchema) {
  requestSchema.parse(body || {})
  return {
    dryRun: body.dry_run,
    filenames: body.filenames,
    prefix: body.prefix,
    sourceFolder: body.source_folder,
  }
}

export { validateRequestBody, type RequestSchema }
export default requestSchema
