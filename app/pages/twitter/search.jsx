import { useState } from 'react'

const Search = () => {
  const [keyword, setKeyword] = useState('')
  const handleSubmit = (event) => {
    // TODO get the keyword from the input
    console.log('User is searching for ', keyword)
    event.preventDefault()
  }

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
