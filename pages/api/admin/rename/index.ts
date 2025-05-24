import type { NextApiRequest, NextApiResponse } from 'next'

import { errorSchema, renamePaths } from '../../../../src/lib/rename'
import requestSchema, { validateRequestBody } from '../../../../src/models/rename'
import { isZodError, simplifyZodMessages } from '../../../../src/lib/utils'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { method, body } = req

    switch (method) {
      case 'POST': {
        const validParams = validateRequestBody(body)
        const out = await renamePaths(validParams)
        return res.status(200).json(out)
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
