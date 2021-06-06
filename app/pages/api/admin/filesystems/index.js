import local from '../../../../src/lib/filesystems'

const errorSchema = (message) => ({ files: [], error: { message } })

export default async function handler({ method, query: { path } }, res) {
  switch (method) {
    case 'GET': {
      const out = await local.get(path, errorSchema)
      return res.status(out.status).json(out.body)
    }
    default:
      return res.status(405).json(errorSchema(`Method ${method} Not Allowed`))
  }
}
