export default function handler(req, res) {
  const {
    query: { gallery },
    method,
  } = req

  const errorSchema = (message) => {
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
