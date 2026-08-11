'use client'

import { useCallback, useRef, useState, type Dispatch, type SetStateAction } from 'react'

export default function useMapFilterMemory({
}: Record<string, never> = {}) {
  const [memoryIndex, setMemoryIndexState] = useState(0)
  const resetIndexOnEnableRef = useRef(false)
  const autoInitialViewRef = useRef(true)

  const setMemoryIndex: Dispatch<SetStateAction<number>> = useCallback((value) => {
    setMemoryIndexState((previousIndex) => {
      const nextIndex = typeof value === 'function' ? value(previousIndex) : value
      return previousIndex === nextIndex ? previousIndex : nextIndex
    })
  }, [])

  const prepareForMapFilterEnable = useCallback(() => {
    resetIndexOnEnableRef.current = true
    autoInitialViewRef.current = false
  }, [])

  return {
    autoInitialViewRef,
    memoryIndex,
    prepareForMapFilterEnable,
    resetIndexOnEnableRef,
    setMemoryIndex,
  }
}
