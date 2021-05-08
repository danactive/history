import local from './local'

const errorSchema = (message) => ({ galleries: [], error: { message } })

export default async function handler({ method }, res) {
  switch (method) {
    case 'GET': {
      const out = await local.get(errorSchema)
      return res.status(out.status).json(out.body)
    }
    default:
      return res.status(405).json(errorSchema(`Method ${method} Not Allowed`))
  }
}
