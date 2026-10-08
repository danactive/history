import * as z from 'zod/v4'

export const xmlSaveRequestSchema = z.object({
  expectedRevision: z.string().regex(/^[a-f0-9]{64}$/).optional(),
  curationReview: z.boolean().optional(),
  xml: z.string('XML content is required').refine(
    value => value.trim().length > 0,
    'XML content is required',
  ),
}, 'JSON object body is expected').refine(value => !value.curationReview || Boolean(value.expectedRevision),
  'Curation saves require the loaded source revision')

export type XmlSaveRequest = z.infer<typeof xmlSaveRequestSchema>
