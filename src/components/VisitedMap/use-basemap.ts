import { useCallback, useEffect, useState } from 'react'

export function useBasemap() {
  const [enabled, setEnabled] = useState(true)
  const [online, setOnline] = useState(() => typeof navigator === 'undefined' || navigator.onLine)
  const [failed, setFailed] = useState(false)
  const visible = enabled && online && !failed
  const unavailable = !online || failed

  useEffect(() => {
    const connect = () => { setOnline(true); setFailed(false) }
    const disconnect = () => setOnline(false)
    window.addEventListener('online', connect)
    window.addEventListener('offline', disconnect)
    return () => {
      window.removeEventListener('online', connect)
      window.removeEventListener('offline', disconnect)
    }
  }, [])

  const toggle = useCallback(() => {
    setEnabled(current => !current)
    setFailed(false)
  }, [])
  const fail = useCallback(() => setFailed(true), [])
  return { enabled, visible, unavailable, toggle, fail }
}
