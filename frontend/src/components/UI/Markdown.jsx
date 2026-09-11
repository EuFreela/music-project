import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

/**
 * Renderizador de Markdown (GFM) para textos descritivos:
 * biografia, "sobre o album", notas, letra/traducao.
 * A estilizacao fica em `.markdown-body` (ver index.css).
 */
export default function Markdown({ children, className }) {
  return (
    <div className={`markdown-body ${className || ''}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children || ''}</ReactMarkdown>
    </div>
  )
}

/* ---------- Markdown inline (preserva alinhamento linha a linha) ---------- */

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const INLINE_PATTERN = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[([^\]]+)\]\(([^)\s]+)\))/g

/**
 * Renderiza marcacao inline minima em uma linha unica, sem quebrar o
 * alinhamento EN|PT da letra: **negrito**, *italico*, `codigo` e [link](url).
 */
export function InlineMarkdown({ text }) {
  const parts = []
  const escaped = escapeHtml(text || '')
  let last = 0
  let match
  INLINE_PATTERN.lastIndex = 0

  while ((match = INLINE_PATTERN.exec(escaped)) !== null) {
    if (match.index > last) parts.push(escaped.slice(last, match.index))
    const token = match[1]
    if (token.startsWith('**')) {
      parts.push(<strong key={parts.length}>{token.slice(2, -2)}</strong>)
    } else if (token.startsWith('*')) {
      parts.push(<em key={parts.length}>{token.slice(1, -1)}</em>)
    } else if (token.startsWith('`')) {
      parts.push(<code key={parts.length} className="px-1 py-0.5 rounded bg-gray-100 dark:bg-dark-border text-xs">{token.slice(1, -1)}</code>)
    } else if (token.startsWith('[')) {
      parts.push(
        <a key={parts.length} href={match[3]} target="_blank" rel="noopener noreferrer" className="text-accent-500 hover:underline">
          {match[2]}
        </a>
      )
    }
    last = match.index + token.length
  }
  if (last < escaped.length) parts.push(escaped.slice(last))

  return <>{parts.length ? parts : '\u00A0'}</>
}