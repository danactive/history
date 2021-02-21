import gallery from './gallery';

export default async function handler(req, res) {
  res.status(200).json({ galleries: await gallery.getGalleries() })
}
