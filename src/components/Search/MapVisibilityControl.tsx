import type { Dispatch, SetStateAction } from 'react'

type Props = {
  isMapVisible: boolean
  setIsMapVisible: Dispatch<SetStateAction<boolean>>
}

export default function MapVisibilityControl({
  isMapVisible,
  setIsMapVisible,
}: Props) {
  return (
    <button type="button" onClick={() => setIsMapVisible(visible => !visible)}>
      {isMapVisible ? 'Hide map' : 'Show map'}
    </button>
  )
}
