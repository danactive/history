import { render } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import VideoPlayerHtml5 from '../index'

describe('<VideoPlayerHtml5 />', () => {
  const mockVideoProps = {
    extension: 'mp4',
    poster: 'jpg',
    src: 'video.mp4',
    description: 'Sample HTML5 video',
  }
  test('Expect to not log errors in console', () => {
    const spy = vi.spyOn(global.console, 'error')
    render(<VideoPlayerHtml5 {...mockVideoProps} />)
    expect(spy).not.toHaveBeenCalled()
  })

  test('Should render and match the snapshot', () => {
    const {
      container: { firstChild },
    } = render(<VideoPlayerHtml5 {...mockVideoProps} />)
    expect(firstChild).toMatchSnapshot()
  })
})
