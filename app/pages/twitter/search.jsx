/* global fetch */
import { useState } from 'react'

const Search = () => {
  const [keyword, setKeyword] = useState('')
  const [twitterErrorMsg, setTwitter] = useState('')
  const [twitterList, setTwitterList] = useState('Spinner')

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      const response = await fetch(`/api/twitter?keyword=${keyword}`)
      const result = await response.json()
      setTwitterList(result.tweets.map((tweet) => (<li>{tweet.message}</li>)))
    } catch (error) {
      setTwitter('Could not connect to Twitter')
    }
  }
  console.log('Reusable component re-render')

  return (
    <form onSubmit={handleSubmit}>
      <h1>Twitter</h1>
      <div>Search keyword
        <input type="text" onChange={(event) => setKeyword(event.target.value)} />
        <input type="submit" value="Search Twitter" />
      </div>
      {twitterErrorMsg || (<ul>{twitterList}</ul>)}
    </form>
  )
}

export default Search
