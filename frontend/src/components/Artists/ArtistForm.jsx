import React, { useState } from 'react'
import Modal from '../UI/Modal.jsx'

const EMPTY_FORM = {
  name: '',
  genre: '',
  country: '',
  city: '',
  bio: '',
  spotify: '',
  instagram: '',
  facebook: '',
  youtube: '',
  tiktok: '',
  website: '',
}

const LINK_FIELDS = [
  { key: 'spotify', label: 'Spotify', placeholder: 'https://open.spotify.com/...' },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/...' },
  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/...' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/...' },
  { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/...' },
  { key: 'website', label: 'Site', placeholder: 'https://...' },
]

/**
 * Formulario de criacao/edicao de artista.
 * Aceita `imageFile` (File) como campo extra para upload opcional de foto.
 */
export default function ArtistForm({ open, onClose, artist, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [imageFile, setImageFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  React.useEffect(() => {
    if (open) {
      setError('')
      setImageFile(null)
      const links = artist?.links || {}
      setForm(artist ? {
        name: artist.name || '',
        genre: artist.genre || '',
        country: artist.country || '',
        city: artist.city || '',
        bio: artist.bio || '',
        spotify: links.spotify || '',
        instagram: links.instagram || '',
        facebook: links.facebook || '',
        youtube: links.youtube || '',
        tiktok: links.tiktok || '',
        website: links.website || '',
      } : EMPTY_FORM)
    }
  }, [open, artist])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Nome do artista é obrigatório')
      return
    }
    setSubmitting(true)
    setError('')

    const links = {}
    for (const { key } of LINK_FIELDS) {
      const url = form[key]?.trim()
      if (url) links[key] = url
    }

    try {
      await onSubmit({
        name: form.name.trim(),
        genre: form.genre?.trim() || null,
        country: form.country?.trim() || null,
        city: form.city?.trim() || null,
        bio: form.bio?.trim() || null,
        links: Object.keys(links).length ? links : null,
        imageFile,
      })
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao salvar artista')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <Modal
      title={artist ? 'Editar Artista' : 'Novo Artista'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" form="artist-form" disabled={submitting}>
            {submitting ? 'Salvando...' : 'Salvar'}
          </button>
        </>
      }
    >
      <form id="artist-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="label">Nome do Artista *</label>
          <input
            name="name"
            className="input"
            value={form.name}
            onChange={handleChange}
            placeholder="Ex: Banda Neon"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Gênero</label>
            <input name="genre" className="input" value={form.genre} onChange={handleChange} placeholder="Ex: Pop" />
          </div>
          <div>
            <label className="label">País</label>
            <input name="country" className="input" value={form.country} onChange={handleChange} placeholder="Ex: Brasil" />
          </div>
          <div>
            <label className="label">Cidade</label>
            <input name="city" className="input" value={form.city} onChange={handleChange} placeholder="Ex: São Paulo" />
          </div>
        </div>

        <div>
          <label className="label">Bio</label>
          <textarea
            name="bio"
            className="input min-h-[90px]"
            value={form.bio}
            onChange={handleChange}
            placeholder="Biografia, história, integrantes..."
          />
        </div>

        <div>
          <label className="label">Redes e Links</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {LINK_FIELDS.map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input
                  name={key}
                  className="input"
                  value={form[key]}
                  onChange={handleChange}
                  placeholder={placeholder}
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Foto do Artista</label>
          <input
            type="file"
            accept="image/*"
            className="input"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
          <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP ou GIF (máx 10MB).</p>
        </div>
      </form>
    </Modal>
  )
}