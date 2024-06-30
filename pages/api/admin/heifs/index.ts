import type { NextApiRequest, NextApiResponse } from 'next'

import post from '../../../../src/lib/heifs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, body } = req
  switch (method) {
    case 'POST': {
      const out = await post(body.files, body.destinationPath, true)
      return res.status(out.status).json(out.body)
    }
    default:
      return res.status(405)
  }
}
