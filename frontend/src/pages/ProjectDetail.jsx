import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api.js'
import Modal from '../components/UI/Modal.jsx'
import StatusBadge, { RELEASE_TYPE_MAP } from '../components/UI/StatusBadge.jsx'
import SecureImage from '../components/UI/SecureImage.jsx'
import TrackAudio from '../components/UI/TrackAudio.jsx'
import TrackLyrics from '../components/UI/TrackLyrics.jsx'

const TABS = [
  { id: 'faixas', label: 'Faixas', icon: '🎵' },
  { id: 'geral', label: 'Geral', icon: '📋' },
  { id: 'colaboradores', label: 'Colaboradores', icon: '👥' },
  { id: 'arquivos', label: 'Arquivos', icon: '📁' },
  { id: 'financas', label: 'Finanças', icon: '💰' },
]

const PLATFORM_LABELS = {
  spotify: 'Spotify',
  apple_music: 'Apple Music',
  youtube: 'YouTube',
  youtube_music: 'YouTube Music',
  deezer: 'Deezer',
  amazon: 'Amazon Music',
  tidal: 'Tidal',
  site: 'Site',
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
}

export default function ProjectDetail() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('faixas')

  // Modais
  const [trackModal, setTrackModal] = useState(null)     // null | {} | track
  const [collabModal, setCollabModal] = useState(null)   // null | {} | collab
  const [askDelete, setAskDelete] = useState(null)       // {type, item}

  const loadProject = useCallback(async () => {
    try {
      const { data } = await api.get(`/projects/${id}`)
      setProject(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao carregar projeto')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { loadProject() }, [loadProject])

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '—'
  const formatDuration = (sec) => {
    if (!sec) return '—'
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }
  const formatMoney = (v) => (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const formatSize = (bytes) => {
    if (!bytes) return '—'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // ---------- Faixas ----------
  const saveTrack = async (data) => {
    if (trackModal?.id) {
      await api.put(`/projects/${id}/tracks/${trackModal.id}`, data)
    } else {
      await api.post(`/projects/${id}/tracks`, data)
    }
    setTrackModal(null)
    loadProject()
  }

  const deleteTrack = async () => {
    await api.delete(`/projects/${id}/tracks/${askDelete.item.id}`)
    setAskDelete(null)
    loadProject()
  }

  // ---------- Audio MP3 das faixas ----------
  const [audioUploadingId, setAudioUploadingId] = useState(null)

  const uploadTrackAudio = async (e, trackId) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAudioUploadingId(trackId)
    const formData = new FormData()
    formData.append('file', file)
    try {
      await api.post(`/projects/${id}/tracks/${trackId}/audio`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      loadProject()
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro no upload do áudio')
    } finally {
      setAudioUploadingId(null)
      e.target.value = ''
    }
  }

  const deleteTrackAudio = async (trackId) => {
    await api.delete(`/projects/${id}/tracks/${trackId}/audio`)
    setAskDelete(null)
    loadProject()
  }

  const confirmDelete = () => {
    if (askDelete.type === 'track') return deleteTrack()
    if (askDelete.type === 'audio') return deleteTrackAudio(askDelete.item.id)
    if (askDelete.type === 'collab') return deleteCollab()
    return deleteFile()
  }

  const getTrackLyricsUrl = (track) => {
    const l = track.links || {}
    return l.lyrics_url || l.streaming_url || l.spotify || l.youtube || l.youtube_music || l.deezer || null
  }

  // ---------- Letra & Traducao (painel de leitura, sem modal) ----------
  const [lyricsTrackId, setLyricsTrackId] = useState(null)

  const saveTrackLyrics = async (data) => {
    const track = project.tracks.find((t) => t.id === lyricsTrackId)
    if (!track) return
    await api.put(`/projects/${id}/tracks/${track.id}`, { lyrics: data.lyrics, translation: data.translation })
    loadProject()
  }

  // ---------- Colaboradores ----------
  const saveCollab = async (data) => {
    if (collabModal?.id) {
      await api.put(`/projects/${id}/collaborators/${collabModal.id}`, data)
    } else {
      await api.post(`/projects/${id}/collaborators`, data)
    }
    setCollabModal(null)
    loadProject()
  }

  const deleteCollab = async () => {
    await api.delete(`/projects/${id}/collaborators/${askDelete.item.id}`)
    setAskDelete(null)
    loadProject()
  }

  // ---------- Capa ----------
  const [uploadingCover, setUploadingCover] = useState(false)
  const uploadCover = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingCover(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      await api.post(`/projects/${id}/cover`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      loadProject()
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro no upload da capa')
    } finally {
      setUploadingCover(false)
      e.target.value = ''
    }
  }

  // ---------- Arquivos ----------
  const [uploading, setUploading] = useState(false)
  const uploadFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)

    const formData = new FormData()
    formData.append('file', file)

    try {
      await api.post(`/projects/${id}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      loadProject()
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro no upload')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const downloadFile = async (fileRecord) => {
    try {
      const res = await api.get(`/projects/${id}/files/${fileRecord.id}/download`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = fileRecord.original_filename
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert(err.response?.data?.detail || 'Erro no download')
    }
  }

  const deleteFile = async () => {
    await api.delete(`/projects/${id}/files/${askDelete.item.id}`)
    setAskDelete(null)
    loadProject()
  }

  if (loading) return <div className="flex justify-center py-20"><span className="text-4xl animate-spin">⚙️</span></div>

  if (error) return (
    <div className="text-center py-20">
      <p className="text-red-500 mb-4">{error}</p>
      <Link to="/" className="btn-secondary">Voltar</Link>
    </div>
  )

  if (!project) return null

  const profit = (project.revenue || 0) - (project.budget || 0)
  const artistName = project.artist_ref?.name || project.artist || 'Artista não definido'
  const projectLinks = project.links || {}

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Cabecalho */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link to="/" className="btn-ghost !px-3 !py-1.5 text-sm">← Voltar</Link>
        <StatusBadge status={project.status} />
      </div>

      {/* Capa + informacoes */}
      <div className="card overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          <div className="sm:w-72 shrink-0 relative">
            <SecureImage
              src={project.cover_image_path ? `/projects/${id}/cover` : null}
              alt={project.name}
              fallback={project.release_type === 'single' ? '🎵' : '💿'}
              className="w-full aspect-square object-cover"
            />
            <label className="absolute bottom-3 right-3 btn-secondary !py-1.5 !px-3 text-xs cursor-pointer">
              {uploadingCover ? 'Enviando...' : '⬆ Capa'}
              <input type="file" accept="image/*" className="hidden" onChange={uploadCover} disabled={uploadingCover} />
            </label>
          </div>
          <div className="flex-1 p-6 space-y-3 min-w-0">
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <div className="flex flex-wrap items-center gap-2">
              {project.artist_ref ? (
                <Link to={`/artists/${project.artist_ref.id}`} className="text-accent-500 hover:underline font-medium">
                  {artistName}
                </Link>
              ) : (
                <span className="text-gray-500 dark:text-gray-400 font-medium">{artistName}</span>
              )}
              {project.genre && <span className="text-gray-500 dark:text-gray-400">• {project.genre}</span>}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {RELEASE_TYPE_MAP[project.release_type] || 'Álbum'} • Lançamento: {formatDate(project.release_date)}
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {project.label && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs border border-light-border dark:border-dark-border text-gray-600 dark:text-dark-text-secondary">
                  🏷️ {project.label}
                </span>
              )}
              {project.upc && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs border border-light-border dark:border-dark-border text-gray-600 dark:text-dark-text-secondary">
                  UPC: {project.upc}
                </span>
              )}
              {project.distributed && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/30">
                  🌐 Distribuído
                </span>
              )}
            </div>
            {Object.keys(projectLinks).length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {Object.entries(projectLinks).map(([platform, url]) => {
                  if (!url) return null
                  return (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border border-light-border dark:border-dark-border hover:border-accent-500/50 text-gray-600 dark:text-dark-text-secondary"
                    >
                      {PLATFORM_LABELS[platform] || platform} ↗
                    </a>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-light-border dark:border-dark-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id
                ? 'border-accent-500 text-accent-500'
                : 'border-transparent text-gray-500 dark:text-dark-text-secondary hover:text-accent-500'
            }`}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ---------- ABA FAIXAS ---------- */}
      {tab === 'faixas' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button className="btn-primary !py-1.5 !px-3 text-sm" onClick={() => setTrackModal({})}>
              + Adicionar Faixa
            </button>
          </div>

          {project.tracks.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              Nenhuma faixa registrada. Adicione músicas ao projeto.
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-dark-border/50">
                  <tr className="text-left text-gray-500 dark:text-gray-400">
                    <th className="px-4 py-3 font-medium">#</th>
                    <th className="px-4 py-3 font-medium">Título</th>
                    <th className="px-4 py-3 font-medium">ISRC</th>
                    <th className="px-4 py-3 font-medium">Duração</th>
                    <th className="px-4 py-3 font-medium">Áudio</th>
                    <th className="px-4 py-3 font-medium">Letra</th>
                    <th className="px-4 py-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-border dark:divide-dark-border">
                  {[...project.tracks].sort((a, b) => (a.track_number || 0) - (b.track_number || 0)).map((track) => (
                    <tr key={track.id} className="hover:bg-gray-50 dark:hover:bg-dark-card">
                      <td className="px-4 py-3 text-gray-400">{track.track_number || '—'}</td>
                      <td className="px-4 py-3 font-medium">{track.title}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 font-mono text-xs">{track.isrc || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{formatDuration(track.duration_seconds)}</td>
                      <td className="px-4 py-3">
                        {track.audio_original_filename ? (
                          <div className="flex items-center gap-2 min-w-[170px]">
                            <TrackAudio src={`/projects/${id}/tracks/${track.id}/audio`} title={track.title} />
                            <button
                              className="btn-ghost !py-1 !px-1.5 text-xs hover:!text-red-500"
                              onClick={() => setAskDelete({ type: 'audio', item: track })}
                              title={`Remover áudio: ${track.audio_original_filename}`}
                            >
                              🗑️
                            </button>
                          </div>
                        ) : (
                          <label className="btn-ghost !py-1 !px-2 text-xs cursor-pointer inline-block" title="Enviar MP3 da faixa">
                            {audioUploadingId === track.id ? 'Enviando…' : '⬆ MP3'}
                            <input
                              type="file"
                              accept="audio/*,.mp3,.wav,.flac,.aac,.ogg,.m4a"
                              className="hidden"
                              onChange={(e) => uploadTrackAudio(e, track.id)}
                              disabled={audioUploadingId === track.id}
                            />
                          </label>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {getTrackLyricsUrl(track) ? (
                          <a
                            href={getTrackLyricsUrl(track)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border border-light-border dark:border-dark-border hover:border-accent-500/50 text-gray-600 dark:text-dark-text-secondary"
                          >
                            📝 Letra ↗
                          </a>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          className={`btn-ghost !py-1 !px-2 text-sm ${lyricsTrackId === track.id ? '!text-accent-500' : ''}`}
                          onClick={() => setLyricsTrackId(lyricsTrackId === track.id ? null : track.id)}
                          title="Ler/editar letra e tradução"
                        >
                          📖
                        </button>
                        <button className="btn-ghost !py-1 !px-2 text-sm" onClick={() => setTrackModal(track)}>✏️</button>
                        <button className="btn-ghost !py-1 !px-2 text-sm hover:!text-red-500" onClick={() => setAskDelete({ type: 'track', item: track })}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {lyricsTrackId && (() => {
            const current = project.tracks.find((t) => t.id === lyricsTrackId)
            if (!current) return null
            return (
              <TrackLyrics
                track={current}
                onSave={saveTrackLyrics}
              />
            )
          })()}

          {trackModal && (
            <TrackFormModal
              track={trackModal.id ? trackModal : null}
              onClose={() => setTrackModal(null)}
              onSubmit={saveTrack}
              existingTracks={project.tracks}
            />
          )}
        </div>
      )}

      {/* ---------- ABA GERAL ---------- */}
      {tab === 'geral' && (
        <div className="card p-6 space-y-4">
          <h3 className="font-semibold">Notas e Observações</h3>
          <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
            {project.notes || 'Nenhuma nota registrada ainda.'}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-light-border dark:border-dark-border text-center">
            <div>
              <p className="text-2xl font-bold">{project.tracks.length}</p>
              <p className="text-xs text-gray-400">Faixas</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{project.collaborators.length}</p>
              <p className="text-xs text-gray-400">Colaboradores</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{project.files.length}</p>
              <p className="text-xs text-gray-400">Arquivos</p>
            </div>
            <div>
              <p className={`text-2xl font-bold ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatMoney(profit)}
              </p>
              <p className="text-xs text-gray-400">Resultado</p>
            </div>
          </div>
        </div>
      )}

      {/* ---------- ABA COLABORADORES ---------- */}
      {tab === 'colaboradores' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button className="btn-primary !py-1.5 !px-3 text-sm" onClick={() => setCollabModal({})}>
              + Adicionar Colaborador
            </button>
          </div>

          {project.collaborators.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              Nenhum colaborador registrado.
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-dark-border/50">
                  <tr className="text-left text-gray-500 dark:text-gray-400">
                    <th className="px-4 py-3 font-medium">Nome</th>
                    <th className="px-4 py-3 font-medium">Função</th>
                    <th className="px-4 py-3 font-medium">Contato</th>
                    <th className="px-4 py-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-border dark:divide-dark-border">
                  {project.collaborators.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-dark-card">
                      <td className="px-4 py-3 font-medium">{c.name}</td>
                      <td className="px-4 py-3">{c.role || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{c.contact || '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <button className="btn-ghost !py-1 !px-2 text-sm" onClick={() => setCollabModal(c)}>✏️</button>
                        <button className="btn-ghost !py-1 !px-2 text-sm hover:!text-red-500" onClick={() => setAskDelete({ type: 'collab', item: c })}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {collabModal && (
            <CollabFormModal
              collab={collabModal.id ? collabModal : null}
              onClose={() => setCollabModal(null)}
              onSubmit={saveCollab}
            />
          )}
        </div>
      )}

      {/* ---------- ABA ARQUIVOS ---------- */}
      {tab === 'arquivos' && (
        <div className="space-y-4">
          <div>
            <label className="btn-primary !py-1.5 !px-3 text-sm cursor-pointer inline-block">
              {uploading ? 'Enviando...' : '⬆ Upload de Arquivo'}
              <input type="file" className="hidden" onChange={uploadFile} disabled={uploading} />
            </label>
          </div>

          {project.files.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              Nenhum arquivo enviado. Formatos: áudio, imagem, documentos (até 50MB).
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-dark-border/50">
                  <tr className="text-left text-gray-500 dark:text-gray-400">
                    <th className="px-4 py-3 font-medium">Tipo</th>
                    <th className="px-4 py-3 font-medium">Arquivo</th>
                    <th className="px-4 py-3 font-medium">Tamanho</th>
                    <th className="px-4 py-3 font-medium">Enviado em</th>
                    <th className="px-4 py-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-border dark:divide-dark-border">
                  {project.files.map((f) => (
                    <tr key={f.id} className="hover:bg-gray-50 dark:hover:bg-dark-card">
                      <td className="px-4 py-3">
                        {f.file_type === 'audio' ? '🎵' : f.file_type === 'image' ? '🖼️' : '📄'}
                      </td>
                      <td className="px-4 py-3 font-medium truncate max-w-[200px]" title={f.original_filename}>
                        {f.original_filename}
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{formatSize(f.file_size)}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{formatDate(f.created_at)}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button className="btn-ghost !py-1 !px-2 text-sm" onClick={() => downloadFile(f)}>⬇</button>
                        <button className="btn-ghost !py-1 !px-2 text-sm hover:!text-red-500" onClick={() => setAskDelete({ type: 'file', item: f })}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="px-4 py-3 text-xs text-gray-400 bg-gray-50 dark:bg-dark-border/30">
                🔒 Arquivos protegidos - acesso apenas via API autenticada
              </p>
            </div>
          )}
        </div>
      )}

      {/* ---------- ABA FINANCAS ---------- */}
      {tab === 'financas' && (
        <div className="card p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-light-border dark:border-dark-border text-center">
              <p className="text-xs text-gray-400 mb-1">Orçamento</p>
              <p className="text-xl font-bold">{formatMoney(project.budget)}</p>
            </div>
            <div className="p-4 rounded-xl border border-light-border dark:border-dark-border text-center">
              <p className="text-xs text-gray-400 mb-1">Receita</p>
              <p className="text-xl font-bold text-green-500">{formatMoney(project.revenue)}</p>
            </div>
            <div className="p-4 rounded-xl border border-light-border dark:border-dark-border text-center">
              <p className="text-xs text-gray-400 mb-1">Resultado</p>
              <p className={`text-xl font-bold ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatMoney(profit)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Modal de confirmacao ---------- */}
      {askDelete && (
        <div className="modal-overlay" onClick={() => setAskDelete(null)}>
          <div className="modal-content !max-w-sm text-center" onClick={(e) => e.stopPropagation()}>
            <span className="text-4xl block mb-3">🗑️</span>
            <h2 className="text-lg font-semibold mb-2">Excluir?</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {askDelete.type === 'audio' ? (
                <>Tem certeza que deseja remover o áudio da faixa <strong className="text-light-text dark:text-dark-text">{askDelete.item.title}</strong>?</>
              ) : (
                <>Tem certeza que deseja excluir <strong className="text-light-text dark:text-dark-text">{askDelete.item.title || askDelete.item.name || askDelete.item.original_filename}</strong>?</>
              )}
            </p>
            <div className="flex gap-2 justify-center">
              <button className="btn-secondary" onClick={() => setAskDelete(null)}>Cancelar</button>
              <button className="btn-danger" onClick={confirmDelete}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------- Modal de faixa ---------- */
function TrackFormModal({ track, onClose, onSubmit, existingTracks }) {
  const [form, setForm] = useState(track ? {
    title: track.title || '',
    isrc: track.isrc || '',
    duration_seconds: track.duration_seconds ?? '',
    track_number: track.track_number ?? (existingTracks.length + 1),
    link: (track.links && (track.links.lyrics_url || track.links.streaming_url || track.links.spotify || track.links.youtube || '')) || '',
  } : {
    title: '',
    isrc: '',
    duration_seconds: '',
    track_number: existingTracks.length + 1,
    link: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('Título da faixa é obrigatório'); return }
    setLoading(true)
    try {
      await onSubmit({
        title: form.title.trim(),
        isrc: form.isrc?.trim() || null,
        duration_seconds: form.duration_seconds === '' ? null : Number(form.duration_seconds),
        track_number: form.track_number === '' ? null : Number(form.track_number),
        links: form.link?.trim() ? { lyrics_url: form.link.trim() } : null,
      })
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao salvar faixa')
      setLoading(false)
    }
  }

  return (
    <Modal title={track ? 'Editar Faixa' : 'Nova Faixa'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</div>}
        <div>
          <label className="label">Título *</label>
          <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: Intro" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">ISRC</label>
            <input
              className="input font-mono text-xs"
              value={form.isrc}
              onChange={(e) => setForm({ ...form, isrc: e.target.value.toUpperCase() })}
              placeholder="Ex: BR-B5X-26-00001"
            />
          </div>
          <div>
            <label className="label">Número da Faixa</label>
            <input type="number" min="1" className="input" value={form.track_number} onChange={(e) => setForm({ ...form, track_number: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="label">Duração (segundos)</label>
          <input type="number" min="0" className="input" value={form.duration_seconds} onChange={(e) => setForm({ ...form, duration_seconds: e.target.value })} placeholder="Ex: 215" />
        </div>
        <div>
          <label className="label">Link da letra</label>
          <input
            type="url"
            className="input"
            value={form.link}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
            placeholder="Onde a letra foi publicada (site de letras, YouTube…)"
          />
          <p className="text-xs text-gray-400 mt-1">Ex.: https://www.letras.mus.br/… — aparece no botão "Letra" da faixa. A letra e a tradução são escritas no painel 📖.</p>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</button>
        </div>
      </form>
    </Modal>
  )
}

/* ---------- Modal de colaborador ---------- */
function CollabFormModal({ collab, onClose, onSubmit }) {
  const [form, setForm] = useState(collab ? {
    name: collab.name || '',
    role: collab.role || '',
    contact: collab.contact || '',
  } : { name: '', role: '', contact: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Nome é obrigatório'); return }
    setLoading(true)
    try {
      await onSubmit(form)
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao salvar colaborador')
      setLoading(false)
    }
  }

  return (
    <Modal title={collab ? 'Editar Colaborador' : 'Novo Colaborador'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</div>}
        <div>
          <label className="label">Nome *</label>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: João Silva" required />
        </div>
        <div>
          <label className="label">Função</label>
          <input className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Ex: Produtor, Baterista" />
        </div>
        <div>
          <label className="label">Contato</label>
          <input className="input" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="Email, telefone..." />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</button>
        </div>
      </form>
    </Modal>
  )
}