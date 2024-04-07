import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    query: { gallery },
    method,
  } = req

  const errorSchema = (message: string) => {
    const out = { gallery: [] }
    if (!message) return out
    return { ...out, error: { message } }
  }

  switch (method) {
    case 'GET': {
      const out = { body: { gallery: { name: gallery } }, status: 200 }
      return res.status(out.status).json(out.body)
    }
    default:
      return res.status(405).json(errorSchema(`Method ${method} Not Allowed`))
  }
}
