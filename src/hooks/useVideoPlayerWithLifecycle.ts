import { useCallback, useEffect, useRef, useState } from 'react'
import { AppState } from 'react-native'
import { useFocusEffect } from 'expo-router'
import { useVideoPlayer, type VideoSource } from 'expo-video'

export function useVideoPlayerWithLifecycle(source: VideoSource) {
  const [isFocused, setIsFocused] = useState(true)
  const isFocusedRef = useRef(true)

  const player = useVideoPlayer(source, (p) => {
    p.loop = true
    p.muted = true
    p.play()
  })

  useFocusEffect(
    useCallback(() => {
      isFocusedRef.current = true
      setIsFocused(true)
      try {
        player.play()
      } catch {}
      return () => {
        isFocusedRef.current = false
        setIsFocused(false)
        try {
          player.pause()
        } catch {}
      }
    }, [player]),
  )

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      try {
        if (state === 'active' && isFocusedRef.current) {
          player.play()
        } else if (state !== 'active') {
          player.pause()
        }
      } catch {}
    })
    return () => sub.remove()
  }, [player])

  return { player, isFocused }
}
