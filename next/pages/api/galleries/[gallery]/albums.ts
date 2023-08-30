import type { NextApiRequest, NextApiResponse } from 'next'

import get, { errorSchema } from '../../../../src/lib/albums'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { gallery },
    method,
  } = req

  switch (method) {
    case 'GET': {
      const out = await get(gallery, true)
      return res.status(out.status).json(out.body)
    }
    default:
      return res.status(405).json(errorSchema(`Method ${method} Not Allowed`))
  }
}
