import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api.js'
import SecureImage from '../components/UI/SecureImage.jsx'
import ArtistForm from '../components/Artists/ArtistForm.jsx'

export default function Artists() {
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [askDelete, setAskDelete] = useState(null)

  const loadArtists = useCallback(async () => {
    try {
      const { data } = await api.get('/artists')
      setArtists(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao carregar artistas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadArtists() }, [loadArtists])

  const handleSubmit = async (data) => {
    const { imageFile, ...payload } = data
    if (editing) {
      await api.put(`/artists/${editing.id}`, payload)
      if (imageFile) {
        const fd = new FormData()
        fd.append('file', imageFile)
        await api.post(`/artists/${editing.id}/image`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }
      setEditing(null)
    } else {
      const { data: created } = await api.post('/artists', payload)
      if (imageFile) {
        const fd = new FormData()
        fd.append('file', imageFile)
        await api.post(`/artists/${created.id}/image`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }
    }
    loadArtists()
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/artists/${askDelete.id}`)
      setAskDelete(null)
      loadArtists()
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao excluir artista')
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Cabecalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Artistas</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gerencie artistas e seus lançamentos</p>
        </div>
        <button
          onClick={() => { setEditing(null); setFormOpen(true) }}
          className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-accent-500 text-white text-xl font-semibold leading-none hover:bg-accent-600 transition-colors shadow-sm"
          title="Novo Artista"
          aria-label="Novo Artista"
        >
          +
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-24 bg-gray-200 dark:bg-dark-card rounded mb-3" />
              <div className="h-4 bg-gray-200 dark:bg-dark-card rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-200 dark:bg-dark-card rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {!loading && !error && (
        artists.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-6xl block mb-4">🎤</span>
            <h2 className="text-xl font-semibold mb-2">Nenhum artista cadastrado</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Cadastre um artista para organizar os lançamentos (álbuns, EPs, singles).
            </p>
            <button onClick={() => { setEditing(null); setFormOpen(true) }} className="btn-primary">
              + Criar Artista
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {artists.map((artist) => (
              <div key={artist.id} className="card overflow-hidden hover:shadow-lg transition-shadow group">
                <Link to={`/artists/${artist.id}`} className="block">
                  <SecureImage
                    src={artist.image_path ? `/artists/${artist.id}/image` : null}
                    alt={artist.name}
                    fallback="🎤"
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-5">
                    <h3 className="font-semibold text-light-text dark:text-dark-text text-lg truncate group-hover:text-accent-500 transition-colors">
                      {artist.name}
                    </h3>
                    <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                      {[artist.genre, artist.country, artist.city].filter(Boolean).join(' • ') || 'Sem informações'}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {artist.projects?.length ?? 0} lançamento(s)
                    </p>
                  </div>
                </Link>
                <div className="flex items-center justify-end gap-1 px-5 pb-4">
                  <button
                    onClick={() => { setEditing(artist); setFormOpen(true) }}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-light-border dark:border-dark-border hover:border-accent-500/50 hover:text-accent-500 text-gray-600 dark:text-dark-text-secondary"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => setAskDelete(artist)}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-light-border dark:border-dark-border hover:border-red-500/50 hover:text-red-500 text-gray-600 dark:text-dark-text-secondary"
                    title="Excluir"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      <ArtistForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null) }}
        artist={editing}
        onSubmit={handleSubmit}
      />

      {askDelete && (
        <div className="modal-overlay" onClick={() => setAskDelete(null)}>
          <div className="modal-content !max-w-sm text-center" onClick={(e) => e.stopPropagation()}>
            <span className="text-4xl block mb-3">🗑️</span>
            <h2 className="text-lg font-semibold mb-2">Excluir artista?</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              <strong className="text-light-text dark:text-dark-text">{askDelete.name}</strong>
              <br />
              Os projetos serão desvinculados, mas <strong>não</strong> serão excluídos.
            </p>
            <div className="flex gap-2 justify-center">
              <button className="btn-secondary" onClick={() => setAskDelete(null)}>
                Cancelar
              </button>
              <button className="btn-danger" onClick={handleDelete}>
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}