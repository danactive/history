import local from '../../../src/lib/galleries'

export default async function handler({ method }, res) {
  switch (method) {
    case 'GET': {
      const out = await local.get(true)
      return res.status(out.status).json(out.body)
    }
    default:
      return res.status(405).json(local.errorSchema(`Method ${method} Not Allowed`))
  }
}
