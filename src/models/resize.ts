import { z } from 'zod/v4-mini'

const requestSchema = z.object({
  source_folder: z.string('source_folder missing property').check(
    z.trim(),
    z.minLength(1, 'source_folder needs a value'),
  ),
}, 'JSON object body is expected')

type RequestSchema = z.infer<typeof requestSchema>

function validateRequestBody(body: RequestSchema) {
  requestSchema.parse(body || {})
  return {
    sourceFolder: body.source_folder,
  }
}

export { validateRequestBody, type RequestSchema }
export default requestSchema
