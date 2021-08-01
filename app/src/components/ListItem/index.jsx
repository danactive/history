import Item from './Item'
import Wrapper from './Wrapper'

function ListItem({ item }) {
  return (
    <Wrapper>
      <Item>{item}</Item>
    </Wrapper>
  )
}

export default ListItem
