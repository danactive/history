import type { NextApiRequest, NextApiResponse } from 'next'

import post, { errorSchema } from '../../../../src/lib/heifs'
import { isZodError, simplifyZodMessages } from '../../../../src/lib/utils'
import requestSchema from '../../../../src/models/heifs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { method, body } = req

    switch (method) {
      case 'POST': {
        requestSchema.parse(body || {})

        const out = await post(body.files, body.destinationPath, true)
        return res.status(out.status).json(out.body)
      }
      default:
        return res.status(405).json(errorSchema(`Method ${method} Not Allowed`))
    }
  } catch (err) {
    if (isZodError(err)) {
      return res.status(400).json(errorSchema(simplifyZodMessages(err)))
    }
    return res.status(500).json(err)
  }
}
