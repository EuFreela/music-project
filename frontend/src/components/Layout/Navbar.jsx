import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ThemeToggle from './ThemeToggle.jsx'
import SecureImage from '../UI/SecureImage.jsx'
import ZoomableImage from '../UI/ZoomableImage.jsx'
import api from '../../services/api.js'

const DICEBEAR_BASE = 'https://api.dicebear.com/10.x/clay/svg'

export default function Navbar({ onMenuClick }) {
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const loadProfile = () => {
      api.get('/auth/me')
        .then(({ data }) => setProfile(data))
        .catch(() => {})
    }
    loadProfile()

    // Atualiza em tempo real quando o perfil/avatar muda (Conte a pagina "Minha conta")
    window.addEventListener('admin-profile-updated', loadProfile)
    return () => window.removeEventListener('admin-profile-updated', loadProfile)
  }, [])

  const email = profile?.email || localStorage.getItem('adminEmail') || 'Admin'

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('adminEmail')
    window.location.href = '/login'
  }

  return (
    <header className="sticky top-0 z-40 border-b border-light-border dark:border-dark-border bg-white/80 dark:bg-black/80 backdrop-blur-lg">
      <div className="flex items-center justify-between px-4 h-16">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-card text-gray-600 dark:text-dark-text-secondary"
          aria-label="Abrir menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎵</span>
          <span className="font-semibold text-light-text dark:text-dark-text hidden sm:block">
            Music Project
          </span>
        </div>

        {/* Pseudo-buscador (client-side) */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <input
            type="text"
            placeholder="Buscar projetos..."
            className="input !py-1.5 bg-light-surface dark:bg-dark-card"
            onChange={(e) => {
              // Dispara evento custom para a Dashboard filtrar
              window.dispatchEvent(new CustomEvent('project-search', { detail: e.target.value }))
            }}
          />
        </div>

        {/* Acoes */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="hidden sm:flex items-center gap-3 pl-2 border-l border-light-border dark:border-dark-border">
            <Link
              to="/conta"
              title="Minha conta"
              className="flex items-center gap-3 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-card px-2 py-1"
            >
              {profile?.avatar_seed ? (
                <ZoomableImage
                  src={`${DICEBEAR_BASE}?seed=${encodeURIComponent(profile.avatar_seed)}`}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : profile?.avatar_path ? (
                <SecureImage
                  src="/api/auth/avatar"
                  alt="Avatar"
                  className="w-8 h-8 rounded-full object-cover"
                  fallback="👤"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-accent-500 flex items-center justify-center text-white font-semibold text-sm">
                  {email.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="hidden sm:block">
                <p className="text-sm font-medium text-light-text dark:text-dark-text">{email}</p>
              </span>
            </Link>
            <button
              onClick={handleLogout}
              className="btn-ghost !px-3 !py-1.5 text-sm inline-flex items-center gap-1.5"
              title="Sair"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sair
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}