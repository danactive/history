/* global fetch */
import { useState } from 'react'

const Search = () => {
  const [keyword, setKeyword] = useState('')
  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      const response = await fetch(`/api/twitter?keyword=${keyword}`)
      const result = await response.json()
      console.log(result)
    } catch (e) {
      // TODO display this error to the user
      console.log('Could not connect to Twitter')
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
      <ul><li>Search results todo</li></ul>
    </form>
  )
}

export default Search
