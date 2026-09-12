import React, { useState } from 'react'
import Modal from './Modal.jsx'
import TrackAudio from './TrackAudio.jsx'
import { InlineMarkdown } from './Markdown.jsx'

/* Extrai o ID de um video do YouTube a partir de varios formatos de URL:
   watch?v=ID, youtu.be/ID, shorts/ID, live/ID, embed/ID */
function getYoutubeId(url) {
  if (!url) return null
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtube.com')) {
      if (u.pathname === '/watch') return u.searchParams.get('v')
      const m = u.pathname.match(/\/(?:embed|shorts|live)\/([\w-]{6,})/)
      return m ? m[1] : null
    }
    if (u.hostname === 'youtu.be') return (u.pathname.slice(1).split('/')[0]) || null
  } catch { /* URL invalida */ }
  return null
}

const TABS = [
  { id: 'letra', label: 'Letra', icon: '📝' },
  { id: 'clipe', label: 'Clipe', icon: '🎬' },
  { id: 'infos', label: 'Infos', icon: '🗂️' },
]

/* Slots de links conhecidos apresentados no overview. */
const LINK_ITEMS = [
  ['clip', 'Clipe (YouTube)'],
  ['streaming_url', 'Link de streaming'],
  ['spotify', 'Spotify'],
  ['youtube', 'YouTube'],
  ['lyrics_url', 'Onde a letra foi publicada'],
]

/* Formata data ISO em pt-BR (ex.: "12 de setembro de 2026, 14:30"). */
function formatDateTime(iso) {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

/* Alinha letra EN | PT linha a linha (guia de leitura). */
function buildPairs(a, b) {
  const left = (a || '').split('\n')
  const right = (b || '').split('\n')
  const n = Math.max(left.length, right.length)
  return Array.from({ length: n }, (_, i) => [left[i] ?? '', right[i] ?? ''])
}

/* Campo rotulado (pares label/valor). Sempre visivel (usa "—" se vazio). */
function Field({ label, value, isText = false }) {
  const text = String(value ?? '').trim()
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">{label}</p>
      {isText ? (
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-light-text dark:text-dark-text bg-light-surface dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg p-3">
          {text || '—'}
        </pre>
      ) : (
        <p className="text-sm text-light-text dark:text-dark-text">{text || '—'}</p>
      )}
    </div>
  )
}

/* Card de secao com cabecalho icone + titulo. */
function Section({ icon, title, children }) {
  return (
    <section className="rounded-xl border border-light-border dark:border-dark-border overflow-hidden">
      <header className="flex items-center gap-2 px-4 py-2.5 bg-light-surface dark:bg-dark-card border-b border-light-border dark:border-dark-border">
        <span aria-hidden>{icon}</span>
        <h3 className="text-sm font-semibold text-light-text dark:text-dark-text">{title}</h3>
      </header>
      <div className="p-4 space-y-3">{children}</div>
    </section>
  )
}

/* Chip de sumario (numero, ISRC, duracao, estado do audio/clipe, ...). */
function Chip({ children, title }) {
  return (
    <span
      title={title}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-light-border dark:border-dark-border bg-white dark:bg-dark-card text-gray-600 dark:text-dark-text-secondary"
    >
      {children}
    </span>
  )
}

/* Link externo (abre em nova aba, com icone de saída). */
function ExternalLink({ label, url }) {
  const text = String(url ?? '').trim()
  if (!text) return null
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">{label}</p>
      <a
        href={text}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-start gap-1 text-sm text-accent-500 hover:underline break-all"
      >
        <span className="break-all">{text}</span>
        <span aria-hidden className="shrink-0">↗</span>
      </a>
    </div>
  )
}

/* Campo de texto longo COM collapse: mostra ~N linhas (padrao 5) e um botao
   "Ver mais/Ver menos" para expandir. Textos curtos caem no Field normal. */
function ExpandableText({ label, value, lines = 5 }) {
  const [open, setOpen] = useState(false)
  const text = String(value ?? '').trim()
  const nLines = text ? text.split('\n').length : 0
  const needsMore = text.length > 0 && (nLines > lines || text.length > 180)

  if (!needsMore) return <Field label={label} value={value} isText />

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">{label}</p>
      <div className="relative">
        <pre
          className={`whitespace-pre-wrap font-sans text-sm leading-relaxed text-light-text dark:text-dark-text bg-light-surface dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg p-3 overflow-hidden ${open ? '' : 'line-clamp-5'}`}
        >
          {text}
        </pre>
        {!open && (
          <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-light-surface dark:from-dark-card to-transparent rounded-b-lg pointer-events-none" />
        )}
      </div>
      <div className="mt-1 flex justify-end">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1 text-xs font-medium text-accent-500 hover:underline"
        >
          {open ? 'Ver menos' : 'Ver mais'} <span aria-hidden>{open ? '▲' : '▼'}</span>
        </button>
      </div>
    </div>
  )
}

/**
 * Modal de visualizacao de uma faixa, com menu lateral:
 *  - Letra: player de audio (se houver) + letra original | traducao (PT-BR)
 *  - Clipe: player do video do YouTube (se houver)
 *  - Infos: overview completo da faixa (numero, titulo, ISRC, duracao, audio,
 *    links, criacao com IA e data de cadastro) em chips e secoes organizadas
 */
export default function TrackViewModal({ track, projectId, initialTab = 'letra', onClose }) {
  const [tab, setTab] = useState(initialTab)

  const clipUrl = (track.links || {}).clip || null
  const clipId = getYoutubeId(clipUrl)
  const hasLyrics = (track.lyrics || track.translation || '').trim().length > 0
  const trackLinks = track.links || {}
  const hasAnyLinks = Object.keys(trackLinks).length > 0
  const createdAt = formatDateTime(track.created_at)

  return (
    <Modal title={`${track.title}`} onClose={onClose}>
      <div className="flex flex-col md:flex-row md:gap-6">
        {/* Menu lateral */}
        <nav className="md:w-44 shrink-0 md:border-r md:border-light-border dark:md:border-dark-border md:pr-4 pb-3 md:pb-0 mb-4 md:mb-0 flex md:flex-col gap-1 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'bg-accent-500/10 text-accent-500 dark:bg-accent-500/15 dark:text-accent-400'
                  : 'text-gray-600 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-card'
              }`}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </nav>

        {/* Conteudo */}
        <div className="flex-1 min-w-0">
          {tab === 'letra' && (
            <div className="space-y-4">
              {track.audio_original_filename ? (
                <div className="flex items-center gap-3">
                  <TrackAudio src={`/projects/${projectId}/tracks/${track.id}/audio`} title={track.title} className="w-full max-w-xs h-9" />
                  <span className="hidden sm:block text-xs text-gray-400 truncate">
                    {track.audio_original_filename} · {track.audio_size ? `${(track.audio_size / (1024 * 1024)).toFixed(1)} MB` : ''}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-gray-400">Nenhum áudio enviado para esta faixa.</p>
              )}

              {!hasLyrics ? (
                <p className="text-sm text-gray-400">Nenhuma letra registrada ainda.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-light-border dark:bg-dark-border rounded-lg overflow-hidden text-sm">
                  <div className="bg-light-card dark:bg-dark-card px-4 py-2 font-semibold text-gray-600 dark:text-dark-text-secondary">
                    🇬🇧 Letra original
                  </div>
                  <div className="bg-light-card dark:bg-dark-card px-4 py-2 font-semibold text-gray-600 dark:text-dark-text-secondary">
                    🇧🇷 Tradução (PT-BR)
                  </div>
                  {buildPairs(track.lyrics, track.translation).map(([left, right], i) => (
                    <React.Fragment key={i}>
                      <div className="bg-white dark:bg-dark-card px-4 py-1.5 whitespace-pre-wrap leading-relaxed">
                        <InlineMarkdown text={left} />
                      </div>
                      <div className="bg-white dark:bg-dark-card px-4 py-1.5 whitespace-pre-wrap leading-relaxed text-gray-600 dark:text-dark-text-secondary">
                        <InlineMarkdown text={right} />
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'clipe' && (
            clipId ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${clipId}`}
                  title={`Clipe de ${track.title}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="text-center py-10">
                <span className="text-4xl block mb-3">🎬</span>
                <p className="text-sm text-gray-400">
                  Nenhum clipe cadastrado para esta faixa. Adicione o link do YouTube na edição.
                </p>
              </div>
            )
          )}

          {tab === 'infos' && (
            <div className="space-y-5">
              {/* Resumo rapido em chips */}
              <div className="flex flex-wrap gap-2">
                {track.track_number != null && <Chip title="Número da faixa"># {track.track_number}</Chip>}
                {track.duration && <Chip title="Duração">⏱️ {track.duration}</Chip>}
                {track.isrc && <Chip title="ISRC">💿 {track.isrc}</Chip>}
                <Chip title={track.audio_original_filename ? 'Áudio anexado' : 'Sem áudio anexado'}>
                  🎧 {track.audio_original_filename ? 'Com áudio' : 'Sem áudio'}
                </Chip>
                <Chip title={clipUrl ? 'Clipe cadastrado' : 'Sem clipe cadastrado'}>
                  🎬 {clipUrl ? 'Com clipe' : 'Sem clipe'}
                </Chip>
                {track.ai_assisted && <Chip title="Criada/auxiliada por plataforma de IA">✨ Com IA</Chip>}
              </div>

              {/* Identificacao */}
              <Section icon="🎵" title="Identificação">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  <Field label="Título" value={track.title} />
                  <Field label="Número da faixa" value={track.track_number != null ? `#${track.track_number}` : null} />
                  <Field label="ISRC" value={track.isrc} />
                  <Field label="Duração" value={track.duration} />
                </div>
              </Section>

              {/* Audio */}
              <Section icon="🎧" title="Áudio">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  <Field label="Arquivo original" value={track.audio_original_filename} />
                  <Field label="Tamanho" value={track.audio_size ? `${(track.audio_size / (1024 * 1024)).toFixed(1)} MB` : null} />
                </div>
                <p className="text-xs text-gray-400">
                  O player fica na aba <span className="font-medium">📝 Letra</span>.
                </p>
              </Section>

              {/* Links */}
              <Section icon="🔗" title="Links">
                {!hasAnyLinks ? (
                  <p className="text-sm text-gray-400">Nenhum link cadastrado.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                    {LINK_ITEMS.map(([key, label]) => (
                      <ExternalLink key={key} label={label} url={trackLinks[key]} />
                    ))}
                  </div>
                )}
              </Section>

              {/* Criacao com IA */}
              <Section icon="🤖" title="Criação com IA">
                {track.ai_assisted && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-accent-500/30 bg-accent-500/10 text-accent-500">
                    ✨ Faixa criada/auxiliada por plataforma de música IA
                  </div>
                )}
                <Field label="Plataforma de música IA" value={track.ai_platform} />
                <ExpandableText label="Letra original definida" value={track.lyrics_original} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  <ExpandableText label="Prompt positivo" value={track.style_positive} />
                  <ExpandableText label="Prompt negativo" value={track.style_negative} />
                </div>
              </Section>

              {/* Registro */}
              {createdAt && (
                <Section icon="🗓️" title="Registro">
                  <Field label="Cadastrada em" value={createdAt} />
                </Section>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}