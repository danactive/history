import * as z from 'zod/v4'

export const xmlSaveRequestSchema = z.object({
  xml: z.string('XML content is required').refine(
    value => value.trim().length > 0,
    'XML content is required',
  ),
}, 'JSON object body is expected')

export type XmlSaveRequest = z.infer<typeof xmlSaveRequestSchema>
