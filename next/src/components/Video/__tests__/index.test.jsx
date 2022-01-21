import { render } from '@testing-library/react'

import VideoPlayerHtml5 from '../index'

describe('<VideoPlayerHtml5 />', () => {
  test('Expect to not log errors in console', () => {
    const spy = jest.spyOn(global.console, 'error')
    render(<VideoPlayerHtml5 />)
    expect(spy).not.toHaveBeenCalled()
  })

  test('Should render and match the snapshot', () => {
    const {
      container: { firstChild },
    } = render(<VideoPlayerHtml5 />)
    expect(firstChild).toMatchSnapshot()
  })
})
