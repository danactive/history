import type { NextApiRequest, NextApiResponse } from 'next'

import get, { errorSchema } from '../../../../src/lib/filesystems'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query: { path } } = req
  switch (method) {
    case 'GET': {
      const out = await get(path, true)
      return res.status(out.status).json(out.body)
    }
    default:
      return res.status(405).json(errorSchema(`Method ${method} Not Allowed`))
  }
}
