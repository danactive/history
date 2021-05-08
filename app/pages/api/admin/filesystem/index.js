import local from './local'

const errorSchema = (message) => ({ galleries: [], error: { message } })

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET': {
      const out = await local.get()
      return res.status(out.status).json(out.body)
    }
    default:
      return res.status(405).json(errorSchema(`Method ${req.method} Not Allowed`))
  }
}
