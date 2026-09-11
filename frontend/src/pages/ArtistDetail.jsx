import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api.js'
import SecureImage from '../components/UI/SecureImage.jsx'
import StatusBadge from '../components/UI/StatusBadge.jsx'
import Markdown from '../components/UI/Markdown.jsx'

const PLATFORM_LABELS = {
  spotify: 'Spotify',
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  website: 'Site',
  apple_music: 'Apple Music',
  deezer: 'Deezer',
  youtube_music: 'YouTube Music',
  amazon: 'Amazon Music',
  tidal: 'Tidal',
}

/**
 * Biografia/descricao com Markdown e botao "Ver mais / Ver menos"
 * quando o texto e longo (biografia expansivel).
 */
function ExpandableBio({ text }) {
  const [open, setOpen] = useState(false)
  if (!text) return null
  const long = text.length > 260
  return (
    <div className="mt-3">
      <div className={!open && long ? 'line-clamp-4' : ''}>
        <Markdown>{text}</Markdown>
      </div>
      {long && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-2 text-xs font-medium text-accent-500 hover:underline"
        >
          {open ? 'Ver menos ↑' : 'Ver mais ↓'}
        </button>
      )}
    </div>
  )
}

function ReleaseSection({ title, icon, releases }) {
  if (releases.length === 0) return null
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <span>{icon}</span> {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {releases.map((p) => (
          <Link key={p.id} to={`/projects/${p.id}`} className="card overflow-hidden hover:shadow-lg transition-shadow group">
            <SecureImage
              src={p.cover_image_path ? `/projects/${p.id}/cover` : null}
              alt={p.name}
              fallback={p.release_type === 'single' ? '🎵' : '💿'}
              className="w-full aspect-square object-cover"
            />
            <div className="p-4">
              <h4 className="font-semibold truncate group-hover:text-accent-500 transition-colors">{p.name}</h4>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {p.release_date ? new Date(p.release_date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : '—'}
                  {' • '}
                  {p.tracks_count ?? 0} faixas
                </p>
                <StatusBadge status={p.status} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default function ArtistDetail() {
  const { id } = useParams()
  const [artist, setArtist] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadArtist = useCallback(async () => {
    try {
      const { data } = await api.get(`/artists/${id}`)
      setArtist(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao carregar artista')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { loadArtist() }, [loadArtist])

  if (loading) return <div className="flex justify-center py-20"><span className="text-4xl animate-spin">⚙️</span></div>

  if (error) return (
    <div className="text-center py-20">
      <p className="text-red-500 mb-4">{error}</p>
      <Link to="/artists" className="btn-secondary">Voltar</Link>
    </div>
  )

  if (!artist) return null

  const projects = artist.projects || []
  const byType = {
    album: projects.filter((p) => p.release_type === 'album'),
    ep: projects.filter((p) => p.release_type === 'ep'),
    single: projects.filter((p) => p.release_type === 'single'),
  }
  const links = artist.links || {}

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link to="/artists" className="btn-ghost !px-3 !py-1.5 text-sm inline-block">← Voltar para Artistas</Link>

      {/* Cabecalho */}
      <div className="card overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-6 p-6">
          <SecureImage
            src={artist.image_path ? `/artists/${artist.id}/image` : null}
            alt={artist.name}
            fallback="🎤"
            className="w-full sm:w-40 h-40 object-cover rounded-xl shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold">{artist.name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {[artist.genre, artist.country, artist.city].filter(Boolean).join(' • ') || 'Sem informações'}
            </p>
            <ExpandableBio text={artist.bio} />
            {Object.keys(links).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {Object.entries(links).map(([platform, url]) => {
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

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-accent-500">{projects.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Lançamentos</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold">{byType.album.length + byType.ep.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Álbuns + EPs</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-orange-500">{byType.single.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Singles</p>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-6xl block mb-4">💿</span>
          <h2 className="text-xl font-semibold mb-2">Nenhum lançamento ainda</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Cadastre projetos e vincule a este artista.
          </p>
          <Link to="/" className="btn-primary">Ir para projetos</Link>
        </div>
      ) : (
        <div className="space-y-8">
          <ReleaseSection title="Álbuns" icon="💿" releases={byType.album} />
          <ReleaseSection title="EPs" icon="📀" releases={byType.ep} />
          <ReleaseSection title="Singles" icon="🎵" releases={byType.single} />
        </div>
      )}
    </div>
  )
}