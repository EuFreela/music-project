import React, { useEffect, useState } from 'react'

/**
 * Leitura e edicao da letra + traducao de uma faixa.
 *
 * - Modo leitura: duas colunas lado a lado (Original | Traducao),
 *   com cada linha alinhada na mesma linha (guia de leitura EN/PT).
 * - Modo edicao: dois textareas lado a lado, sem modal pequeno.
 */
export default function TrackLyrics({ track, onSave }) {
  const [mode, setMode] = useState('read')
  const [lyrics, setLyrics] = useState(track.lyrics || '')
  const [translation, setTranslation] = useState(track.translation || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Sincroniza com o track quando muda apos salvar
  useEffect(() => {
    setLyrics(track.lyrics || '')
    setTranslation(track.translation || '')
    setMode('read')
  }, [track.id, track.lyrics, track.translation])

  const save = async () => {
    setSaving(true)
    setError('')
    try {
      await onSave({ lyrics, translation })
      setMode('read')
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao salvar')
      setSaving(false)
    }
  }

  const buildPairs = (a, b) => {
    const left = (a || '').split('\n')
    const right = (b || '').split('\n')
    const n = Math.max(left.length, right.length)
    return Array.from({ length: n }, (_, i) => [left[i] ?? '', right[i] ?? ''])
  }

  const hasContent = (track.lyrics || track.translation || '').trim().length > 0

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h4 className="font-semibold flex items-center gap-2">
          📖 {track.title}
        </h4>
        {mode === 'read' ? (
          <button className="btn-ghost !py-1 !px-2.5 text-xs" onClick={() => setMode('edit')}>
            ✏️ {hasContent ? 'Editar Letra & Tradução' : 'Escrever Letra & Tradução'}
          </button>
        ) : (
          <div className="flex gap-2">
            <button className="btn-ghost !py-1 !px-2.5 text-xs" onClick={() => setMode('read')}>Cancelar</button>
            <button className="btn-primary !py-1 !px-2.5 text-xs" onClick={save} disabled={saving}>
              {saving ? 'Salvando…' : '💾 Salvar'}
            </button>
          </div>
        )}
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</div>}

      {mode === 'read' ? (
        !hasContent ? (
          <p className="text-sm text-gray-400">Nenhuma letra registrada. Use "Escrever Letra & Tradução".</p>
        ) : (
          <div className="grid grid-cols-2 gap-px bg-light-border dark:bg-dark-border rounded-lg overflow-hidden text-sm">
            <div className="bg-light-card dark:bg-dark-card px-4 py-2 font-semibold text-gray-600 dark:text-dark-text-secondary">
              🇬🇧 Letra original
            </div>
            <div className="bg-light-card dark:bg-dark-card px-4 py-2 font-semibold text-gray-600 dark:text-dark-text-secondary">
              🇧🇷 Tradução (PT-BR)
            </div>
            {buildPairs(track.lyrics, track.translation).map(([left, right], i) => (
              <React.Fragment key={i}>
                <div className="bg-white dark:bg-dark-card px-4 py-1.5 whitespace-pre-wrap leading-relaxed">
                  {left || '\u00A0'}
                </div>
                <div className="bg-white dark:bg-dark-card px-4 py-1.5 whitespace-pre-wrap leading-relaxed text-gray-600 dark:text-dark-text-secondary">
                  {right || '\u00A0'}
                </div>
              </React.Fragment>
            ))}
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">🇬🇧 Letra original</label>
            <textarea
              className="input min-h-[260px] font-mono text-xs leading-relaxed"
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder="Letra da música (uma linha por verso)…"
            />
          </div>
          <div>
            <label className="label">🇧🇷 Tradução (PT-BR)</label>
            <textarea
              className="input min-h-[260px] font-mono text-xs leading-relaxed"
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              placeholder="Tradução equivalente, mesma ordem de linhas…"
            />
          </div>
        </div>
      )}

      {mode === 'edit' && (
        <p className="text-xs text-gray-400">
          💡 Mantenha as linhas na mesma ordem nas duas colunas para o modo leitura alinhar lado a lado.
        </p>
      )}
    </div>
  )
}