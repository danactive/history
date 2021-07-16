import local from '../../../../../src/lib/album'

export default async function handler(req, res) {
  const {
    query: { gallery, album },
    method,
  } = req

  switch (method) {
    case 'GET': {
      const out = await local.get(gallery, album, true)
      return res.status(out.status).json(out.body)
    }
    default:
      return res.status(405).json(local.errorSchema(`Method ${method} Not Allowed`))
  }
}
