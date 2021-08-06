/* global fetch */
import { useState } from 'react'

const Search = () => {
  const [keyword, setKeyword] = useState('')
  const [isTwitterError, setTwitterError] = useState(false)
  const [twitterList, setTwitterList] = useState('Spinner')

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      const response = await fetch(`/api/twitter?keyword=${keyword}`)
      const result = await response.json()
      setTwitterList(result.tweets.map((tweet) => (<li>{tweet.message}</li>)))
    } catch (error) {
      setTwitterError('Could not connect to Twitter')
    }
  }
  console.log('Reusable component re-render')

  let vancouver = <div>Oops</div>

  if (keyword === 'vancouver') {
    vancouver = (<h1>VANCOUVER</h1>)
  } else {
    vancouver = <h5>not van</h5>
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Twitter</h1>
      <div>Search keyword
        <input type="text" onChange={(event) => setKeyword(event.target.value)} />
        <input type="submit" value="Search Twitter" />
      </div>
      {vancouver}
      {isTwitterError && (
        <div>Oops No Twitter!</div>
      )}
      {twitterList && (<ul>{twitterList}</ul>)}
    </form>
  )
}

export default Search
