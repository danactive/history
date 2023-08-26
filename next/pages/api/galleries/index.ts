import get, { errorSchema } from '../../../src/lib/galleries'

export default async function handler(req, res) {
  const { method } = req
  switch (method) {
    case 'GET': {
      const out = await get(true)
      return res.status(out.status).json(out.body)
    }
    default:
      return res.status(405).json(errorSchema(`Method ${method} Not Allowed`))
  }
}
