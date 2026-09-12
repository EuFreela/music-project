import React, { useState } from 'react'
import ImageLightbox from './ImageLightbox.jsx'

/**
 * Imagem simples (URL publica/externa, sem autenticacao) que abre expandida
 * ao ser clicada. Para imagens protegidas use `SecureImage`.
 */
export default function ZoomableImage({ src, alt, className, title }) {
  const [expanded, setExpanded] = useState(false)

  if (!src) return null

  return (
    <>
      <img
        src={src}
        alt={alt || ''}
        title={title}
        className={`${className || ''} cursor-zoom-in`}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setExpanded(true)
        }}
      />
      {expanded && <ImageLightbox src={src} alt={alt} onClose={() => setExpanded(false)} />}
    </>
  )
}
