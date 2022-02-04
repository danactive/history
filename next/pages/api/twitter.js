export default function twitter(req, res) {
  console.log('process.env.TWITTER_TEST', process.env.TWITTER_TEST)
  res.send({
    todo: true,
    env: process.env.TWITTER_TEST,
  })
}
