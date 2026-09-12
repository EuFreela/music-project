import React from 'react'
import { NavLink } from 'react-router-dom'

const menuItems = [
  { to: '/', label: 'Dashboard', icon: '🏠', end: true },
  { to: '/projects', label: 'Projetos', icon: '📁' },
  { to: '/artists', label: 'Artistas', icon: '🎤' },
]

export default function Sidebar({ open, onClose, collapsed, onToggleCollapse }) {
  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:sticky top-16 lg:top-0 z-40 lg:h-screen w-64
          bg-white dark:bg-black border-r border-light-border dark:border-dark-border
          transition-all duration-200
          ${collapsed ? 'lg:w-20' : 'lg:w-64'}
          ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Botao retrair/expandir (desktop) */}
        <button
          onClick={onToggleCollapse}
          title={collapsed ? 'Expandir menu' : 'Retrair menu'}
          className="flex items-center justify-center w-full h-11 border-b border-light-border dark:border-dark-border
            text-gray-500 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-card transition-colors"
        >
          <svg
            className={`w-5 h-5 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 4l8 8-8 8M5 4l8 8-8 8"
            />
          </svg>
          <span className={`ml-2 text-xs font-medium ${collapsed ? 'hidden' : ''}`}>
            {collapsed ? 'Expandir' : 'Retrair'}
          </span>
        </button>

        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${collapsed ? 'justify-center !px-0' : ''}
                ${isActive
                  ? 'bg-accent-500/10 text-accent-500 dark:bg-accent-500/15 dark:text-accent-400'
                  : 'text-gray-600 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-card'}`
              }
            >
              <span className="text-lg">{item.icon}</span>
              <span className={collapsed ? 'hidden' : ''}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={`absolute bottom-0 left-0 right-0 p-4 border-t border-light-border dark:border-dark-border ${collapsed ? 'hidden' : ''}`}>
          <p className="text-xs text-gray-400 dark:text-gray-600">
            Music Project Manager v1.0
          </p>
        </div>
      </aside>
    </>
  )
}
