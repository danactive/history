import type { NextApiRequest, NextApiResponse } from 'next'

import get from '../../../../../src/lib/album'
import { errorSchema } from '../../../../../src/models/album'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { gallery, album },
    method,
  } = req

  switch (method) {
    case 'GET': {
      const out = await get(gallery, album, true)
      return res.status(out.status).json(out.body)
    }
    default:
      return res.status(405).json(errorSchema(`Method ${method} Not Allowed`))
  }
}
