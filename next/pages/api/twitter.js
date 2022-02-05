import Twit from 'twit' // Next.js using import ESM
// const Twit = require('twit'); node.js syntax CommonJS

export default function twitter(req, res) {
  const T = new Twit({
    consumer_key: '...',
    consumer_secret: '...',
    access_token: '...',
    access_token_secret: '...',
    timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
    strictSSL: true, // optional - requires SSL certificates to be valid.
  })

  //
  //  search twitter for all tweets containing the word 'banana' since July 11, 2011
  //
  T.get('search/tweets', { q: 'banana since:2011-07-11', count: 100 }, (err, data) => {
    res.send(data)
  })
}
