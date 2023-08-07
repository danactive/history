import get, { errorSchema } from '../../../../src/lib/filesystems'

export default async function handler({ method, query: { path } }, res) {
  switch (method) {
    case 'GET': {
      const out = await get(path, true)
      return res.status(out.status).json(out.body)
    }
    default:
      return res.status(405).json(errorSchema(`Method ${method} Not Allowed`))
  }
}
