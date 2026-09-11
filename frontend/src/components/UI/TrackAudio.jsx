import React, { useState, useEffect, useRef } from 'react'
import api from '../../services/api.js'

/**
 * Player de audio protegido por autenticacao (Bearer).
 * Busca o MP3 via blob com token e gera Object URL (tag <audio> nao envia token).
 * Se nao tiver audio (src null) ou falhar, renderiza null/estado vazio.
 */
export default function TrackAudio({ src, title, className }) {
  const [url, setUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const urlRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    setUrl(null)
    setFailed(false)
    if (!src) return undefined

    setLoading(true)
    api.get(src, { responseType: 'blob' })
      .then((res) => {
        if (cancelled) return
        if (urlRef.current) URL.revokeObjectURL(urlRef.current)
        urlRef.current = URL.createObjectURL(res.data)
        setUrl(urlRef.current)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [src])

  useEffect(() => () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
  }, [])

  if (!src) return null
  if (loading) return <span className="text-xs text-gray-400">carregando…</span>
  if (failed) return <span className="text-xs text-red-400">áudio indisponível</span>

  return (
    <audio
      controls
      preload="none"
      title={title || 'Play'}
      className={className || 'h-8 w-40'}
    >
      <source src={url} />
    </audio>
  )
}