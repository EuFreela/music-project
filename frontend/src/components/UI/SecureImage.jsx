import React, { useState, useEffect, useRef } from 'react'
import api from '../../services/api.js'
import ImageLightbox from './ImageLightbox.jsx'

/**
 * Exibe uma imagem protegida por autenticacao (Bearer).
 * Busca via blob com token e gera Object URL (img comum nao envia token).
 * Se falhar ou nao tiver imagem, renderiza o placeholder `fallback`.
 *
 * Por padrao (`expandable`), clicar na imagem a abre expandida (lightbox).
 */
export default function SecureImage({ src, alt, className, fallback = '🎵', expandable = true }) {
  const [url, setUrl] = useState(null)
  const [failed, setFailed] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const urlRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    setFailed(false)
    setUrl(null)
    if (!src) return undefined

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

    return () => { cancelled = true }
  }, [src])

  useEffect(() => () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
  }, [])

  if (!url || failed) {
    return (
      <div className={`${className || ''} flex items-center justify-center bg-gray-100 dark:bg-dark-card text-3xl`}>
        <span>{fallback}</span>
      </div>
    )
  }

  const canExpand = expandable && !!url

  return (
    <>
      <img
        src={url}
        alt={alt || ''}
        className={`${className || ''}${canExpand ? ' cursor-zoom-in' : ''}`}
        loading="lazy"
        onClick={canExpand ? (e) => {
          e.preventDefault()
          e.stopPropagation()
          setExpanded(true)
        } : undefined}
      />
      {expanded && <ImageLightbox src={url} alt={alt} onClose={() => setExpanded(false)} />}
    </>
  )
}
