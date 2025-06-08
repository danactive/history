import { z } from 'zod/v4-mini'

const requestSchema = z.object({
  source_folder: z.string('source_folder missing property').check(
    z.trim(),
    z.minLength(1, 'source_folder needs a value'),
  ),
  get_metadata: z.boolean('get_metadata missing bool property'),
}, 'JSON object body is expected')

type RequestSchema = z.infer<typeof requestSchema>

function validateRequestBody(body: RequestSchema) {
  requestSchema.parse(body || {})
  return {
    sourceFolder: body.source_folder,
    metadata: body.get_metadata,
  }
}

export { validateRequestBody, type RequestSchema }
export default requestSchema
