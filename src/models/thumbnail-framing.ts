import * as z from 'zod/v4'

const requestSchema = z.object({
  source_folder: z.string('source_folder missing property').check(
    z.trim(),
    z.minLength(1, 'source_folder needs a value'),
  ),
  filename: z.string('filename missing property').check(
    z.trim(),
    z.minLength(1, 'filename needs a value'),
  ),
  zoom: z.number('zoom must be a number').min(1).max(8),
  position_x: z.number('position_x must be a number').min(0).max(1),
  position_y: z.number('position_y must be a number').min(0).max(1),
}, 'JSON object body is expected')

type RequestSchema = z.infer<typeof requestSchema>

function validateRequestBody(body: RequestSchema) {
  requestSchema.parse(body || {})
  return {
    sourceFolder: body.source_folder,
    filename: body.filename,
    zoom: body.zoom,
    positionX: body.position_x,
    positionY: body.position_y,
  }
}

export { validateRequestBody, type RequestSchema }
export default requestSchema
