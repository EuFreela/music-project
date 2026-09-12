import React from 'react'
import { Link } from 'react-router-dom'
import StatusBadge, { RELEASE_TYPE_MAP } from '../UI/StatusBadge.jsx'
import SecureImage from '../UI/SecureImage.jsx'

export default function ProjectCard({ project, onDelete, onEdit }) {
  const formatDate = (date) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const formatMoney = (value) => {
    const v = Number(value) || 0
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const artistName = project.artist_ref?.name || project.artist || 'Artista não definido'
  const releaseYear = project.release_date
    ? new Date(project.release_date).getFullYear()
    : null

  return (
    <div className="card overflow-hidden hover:shadow-lg transition-shadow group flex flex-col">
      {/* Capa */}
      <Link to={`/projects/${project.id}`} className="block">
        <SecureImage
          src={project.cover_image_path ? `/projects/${project.id}/cover` : null}
          alt={project.name}
          fallback={project.release_type === 'single' ? '🎵' : '💿'}
          className="w-full aspect-square object-cover"
        />
      </Link>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <Link to={`/projects/${project.id}`} className="block min-w-0">
            <h3 className="font-semibold text-light-text dark:text-dark-text text-lg truncate group-hover:text-accent-500 transition-colors">
              {project.name}
            </h3>
          </Link>
          <StatusBadge status={project.status} />
        </div>

        {project.artist_ref ? (
          <Link
            to={`/artists/${project.artist_ref.id}`}
            className="text-sm text-accent-500 hover:underline truncate"
          >
            {artistName}
          </Link>
        ) : (
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary truncate">
            {artistName}
          </p>
        )}
        {project.genre && (
          <p className="text-xs text-gray-400 mb-2">
            {project.genre}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2 text-sm mt-2">
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-600">Tipo</p>
            <p className="text-light-text dark:text-dark-text">
              {RELEASE_TYPE_MAP[project.release_type] || 'Álbum'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-600">Ano</p>
            <p className="text-light-text dark:text-dark-text">{releaseYear || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-600">Faixas</p>
            <p className="text-light-text dark:text-dark-text">{project.tracks?.length ?? project.tracks_count ?? 0}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-600">Orçamento</p>
            <p className="text-light-text dark:text-dark-text">{formatMoney(project.budget)}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-1 mt-4 pt-3 border-t border-light-border dark:border-dark-border">
          <Link
            to={`/projects/${project.id}`}
            className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-light-border dark:border-dark-border hover:border-accent-500/50 hover:text-accent-500 text-gray-600 dark:text-dark-text-secondary text-sm"
            title="Detalhes"
          >
            👁️
          </Link>
          <button
            onClick={() => onEdit?.(project)}
            className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-light-border dark:border-dark-border hover:border-accent-500/50 hover:text-accent-500 text-gray-600 dark:text-dark-text-secondary text-sm"
            title="Editar"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete?.(project)}
            className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-light-border dark:border-dark-border hover:border-red-500/50 hover:text-red-500 text-gray-600 dark:text-dark-text-secondary text-sm"
            title="Excluir"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  )
}