import React, { useState, useEffect, useCallback } from 'react'
import api from '../services/api.js'
import ProjectCard from '../components/Projects/ProjectCard.jsx'
import ProjectForm from '../components/Projects/ProjectForm.jsx'
import { STATUS_MAP } from '../components/UI/StatusBadge.jsx'

export default function Dashboard() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [askDelete, setAskDelete] = useState(null)

  const loadProjects = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (statusFilter) params.status_filter = statusFilter
      const { data } = await api.get('/projects', { params })
      setProjects(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao carregar projetos')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => { loadProjects() }, [loadProjects])

  // Busca via navbar (evento custom)
  useEffect(() => {
    const handler = (e) => setSearch(e.detail)
    window.addEventListener('project-search', handler)
    return () => window.removeEventListener('project-search', handler)
  }, [])

  const handleCreate = async (data) => {
    await api.post('/projects', data)
    loadProjects()
  }

  const handleUpdate = async (data) => {
    await api.put(`/projects/${editing.id}`, data)
    setEditing(null)
    loadProjects()
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/projects/${askDelete.id}`)
      setAskDelete(null)
      loadProjects()
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao excluir projeto')
    }
  }

  const stats = {
    total: projects.length,
    lancados: projects.filter((p) => p.status === 'lancado').length,
    emProducao: projects.filter((p) => ['producao', 'mixagem', 'masterizacao'].includes(p.status)).length,
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Cabecalho + Novo Projeto */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gerencie seus projetos musicais</p>
        </div>
        <button
          onClick={() => { setEditing(null); setFormOpen(true) }}
          className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-accent-500 text-white text-xl font-semibold leading-none hover:bg-accent-600 transition-colors shadow-sm"
          title="Novo Projeto"
          aria-label="Novo Projeto"
        >
          +
        </button>
      </div>

      {/* Estatisticas */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-accent-500">{stats.total}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Projetos</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-green-500">{stats.lancados}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Lançados</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-orange-500">{stats.emProducao}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Em produção</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setStatusFilter('')}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              statusFilter === ''
                ? 'border-accent-500 bg-accent-500/10 text-accent-500'
                : 'border-light-border dark:border-dark-border text-gray-600 dark:text-dark-text-secondary hover:border-accent-500/50'
            }`}
          >
            Todos
          </button>
          {Object.entries(STATUS_MAP).map(([key, conf]) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                statusFilter === key
                  ? 'border-accent-500 bg-accent-500/10 text-accent-500'
                  : 'border-light-border dark:border-dark-border text-gray-600 dark:text-dark-text-secondary hover:border-accent-500/50'
              }`}
            >
              {conf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Erro */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-dark-card rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-200 dark:bg-dark-card rounded w-1/2 mb-4" />
              <div className="h-3 bg-gray-200 dark:bg-dark-card rounded w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Grid de projetos */}
      {!loading && !error && (
        projects.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-6xl block mb-4">🎧</span>
            <h2 className="text-xl font-semibold mb-2">Nenhum projeto encontrado</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Comece criando seu primeiro projeto musical
            </p>
            <button onClick={() => { setEditing(null); setFormOpen(true) }} className="btn-primary">
              + Criar Projeto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={(p) => { setEditing(p); setFormOpen(true) }}
                onDelete={(p) => setAskDelete(p)}
              />
            ))}
          </div>
        )
      )}

      {/* Modal Novo/Editar */}
      <ProjectForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null) }}
        project={editing}
        onSubmit={editing ? handleUpdate : handleCreate}
      />

      {/* Confirmacao de exclusao */}
      {askDelete && (
        <div className="modal-overlay" onClick={() => setAskDelete(null)}>
          <div className="modal-content !max-w-sm text-center" onClick={(e) => e.stopPropagation()}>
            <span className="text-4xl block mb-3">🗑️</span>
            <h2 className="text-lg font-semibold mb-2">Excluir projeto?</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              <strong className="text-light-text dark:text-dark-text">{askDelete.name}</strong>
              <br />
              Essa ação não pode ser desfeita. Faixas, colaboradores e arquivos também serão excluídos.
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