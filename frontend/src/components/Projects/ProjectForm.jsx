import React, { useState, useEffect } from 'react'
import Modal from '../UI/Modal.jsx'
import { STATUS_MAP } from '../UI/StatusBadge.jsx'
import api from '../../services/api.js'

const EMPTY_FORM = {
  name: '',
  artist_id: '',
  artist: '',
  genre: '',
  release_type: 'album',
  release_platform: '',
  release_date: '',
  status: 'planejamento',
  description: '',
  label: '',
  distributor: '',
  upc: '',
  distributed: false,
  budget: '',
  revenue: '',
  notes: '',
  spotify: '',
  apple_music: '',
  youtube_music: '',
  deezer: '',
  site: '',
  instagram: '',
  facebook: '',
  youtube: '',
  tiktok: '',
}

const LINK_FIELDS = [
  { key: 'spotify', label: 'Spotify', placeholder: 'https://open.spotify.com/...' },
  { key: 'apple_music', label: 'Apple Music', placeholder: 'https://music.apple.com/...' },
  { key: 'youtube_music', label: 'YouTube Music', placeholder: 'https://music.youtube.com/...' },
  { key: 'deezer', label: 'Deezer', placeholder: 'https://deezer.com/...' },
  { key: 'site', label: 'Site', placeholder: 'https://...' },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/...' },
  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/...' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/...' },
  { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/...' },
]

/**
 * Formulario de criacao/edicao de projeto em modal.
 * Recebe `project` (null para criar) e `onSubmit(data)`.
 */
export default function ProjectForm({ open, onClose, project, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [artists, setArtists] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Carrega artistas para o select
  useEffect(() => {
    if (open) {
      api.get('/artists')
        .then(({ data }) => setArtists(data))
        .catch(() => setArtists([]))
    }
  }, [open])

  // Preenche formulario quando project mudar
  useEffect(() => {
    if (open) {
      setError('')
      const links = project?.links || {}
      setForm(project ? {
        name: project.name || '',
        artist_id: project.artist_id ?? '',
        artist: project.artist || '',
        genre: project.genre || '',
        release_type: project.release_type || 'album',
        release_platform: project.release_platform || '',
        release_date: project.release_date ? project.release_date.slice(0, 10) : '',
        status: project.status || 'planejamento',
        description: project.description || '',
        label: project.label || '',
        distributor: project.distributor || '',
        upc: project.upc || '',
        distributed: project.distributed ?? false,
        budget: project.budget ?? '',
        revenue: project.revenue ?? '',
        notes: project.notes || '',
        spotify: links.spotify || '',
        apple_music: links.apple_music || '',
        youtube_music: links.youtube_music || '',
        deezer: links.deezer || '',
        site: links.site || '',
        instagram: links.instagram || '',
        facebook: links.facebook || '',
        youtube: links.youtube || '',
        tiktok: links.tiktok || '',
      } : EMPTY_FORM)
    }
  }, [open, project])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Nome do projeto é obrigatório')
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
        artist_id: form.artist_id ? Number(form.artist_id) : null,
        artist: form.artist?.trim() || null,
        genre: form.genre?.trim() || null,
        release_type: form.release_type,
        release_platform: form.release_platform?.trim() || null,
        release_date: form.release_date ? new Date(form.release_date).toISOString() : null,
        status: form.status,
        description: form.description?.trim() || null,
        label: form.label?.trim() || null,
        distributor: form.distributor?.trim() || null,
        upc: form.upc?.trim() || null,
        distributed: Boolean(form.distributed),
        links: Object.keys(links).length ? links : null,
        budget: form.budget === '' ? 0 : Number(form.budget),
        revenue: form.revenue === '' ? 0 : Number(form.revenue),
        notes: form.notes?.trim() || null,
      })
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao salvar projeto')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <Modal
      title={project ? 'Editar Projeto' : 'Novo Projeto'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" form="project-form" disabled={submitting}>
            {submitting ? 'Salvando...' : 'Salvar'}
          </button>
        </>
      }
    >
      <form id="project-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="label">Nome do Projeto *</label>
          <input
            name="name"
            className="input"
            value={form.name}
            onChange={handleChange}
            placeholder="Ex: Álbum Aurora"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Artista</label>
            <select name="artist_id" className="input" value={form.artist_id} onChange={handleChange}>
              <option value="">— Nenhum (digite abaixo) —</option>
              {artists.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            {artists.length === 0 && (
              <p className="text-xs text-gray-400 mt-1">
                Cadastre artistas primeiro para vincular.
              </p>
            )}
          </div>
          <div>
            <label className="label">Artista (nome livre)</label>
            <input
              name="artist"
              className="input"
              value={form.artist}
              onChange={handleChange}
              placeholder="Ex: Banda Neon (sem cadastro)"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Gênero Musical</label>
            <input
              name="genre"
              className="input"
              value={form.genre}
              onChange={handleChange}
              placeholder="Ex: Rock Alternativo"
            />
          </div>
          <div>
            <label className="label">Tipo de Lançamento</label>
            <select name="release_type" className="input" value={form.release_type} onChange={handleChange}>
              <option value="album">Álbum</option>
              <option value="ep">EP</option>
              <option value="single">Single</option>
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select name="status" className="input" value={form.status} onChange={handleChange}>
              {Object.entries(STATUS_MAP).map(([key, conf]) => (
                <option key={key} value={key}>{conf.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Gravadora/Label</label>
            <input
              name="label"
              className="input"
              value={form.label}
              onChange={handleChange}
              placeholder="Ex: Universal Music"
            />
          </div>
          <div>
            <label className="label">Distribuidora</label>
            <input
              name="distributor"
              className="input"
              value={form.distributor}
              onChange={handleChange}
              placeholder="Ex: ONErpm, DistroKid, TuneCore"
            />
          </div>
          <div>
            <label className="label">UPC / Catálogo</label>
            <input
              name="upc"
              className="input"
              value={form.upc}
              onChange={handleChange}
              placeholder="Ex: 196589123456"
            />
          </div>
          <div>
            <label className="label">Plataforma de Lançamento</label>
            <input
              name="release_platform"
              className="input"
              value={form.release_platform}
              onChange={handleChange}
              placeholder="Ex: Spotify, YouTube"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <div>
            <label className="label">Data de Lançamento</label>
            <input
              type="date"
              name="release_date"
              className="input"
              value={form.release_date}
              onChange={handleChange}
            />
          </div>
          <label className="flex items-center gap-2 pb-2 cursor-pointer select-none">
            <input
              type="checkbox"
              name="distributed"
              checked={form.distributed}
              onChange={handleChange}
              className="w-4 h-4 accent-accent-500"
            />
            <span className="text-sm text-light-text dark:text-dark-text">Distribuído (já foi lançado nas plataformas)</span>
          </label>
        </div>

        <div>
          <label className="label">Links de Distribuição</label>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Orçamento (R$)</label>
            <input
              type="number"
              step="0.01"
              name="budget"
              className="input"
              value={form.budget}
              onChange={handleChange}
              placeholder="0,00"
            />
          </div>
          <div>
            <label className="label">Receita (R$)</label>
            <input
              type="number"
              step="0.01"
              name="revenue"
              className="input"
              value={form.revenue}
              onChange={handleChange}
              placeholder="0,00"
            />
          </div>
        </div>

        <div>
          <label className="label">Sobre o Álbum</label>
          <textarea
            name="description"
            className="input min-h-[110px]"
            value={form.description}
            onChange={handleChange}
            placeholder={'Descrição do álbum/EP/single: conceito, história... (Markdown: **negrito**, *itálico*, listas, [links](url))'}
          />
        </div>

        <div>
          <label className="label">Notas/Observações</label>
          <textarea
            name="notes"
            className="input min-h-[80px]"
            value={form.notes}
            onChange={handleChange}
            placeholder={'Anotações, referências, ideias... (Markdown suportado)'}
          />
        </div>
      </form>
    </Modal>
  )
}