import React from 'react'
import { NavLink } from 'react-router-dom'

const menuItems = [
  { to: '/', label: 'Dashboard', icon: '🏠', end: true },
  { to: '/projects', label: 'Projetos', icon: '📁' },
  { to: '/artists', label: 'Artistas', icon: '🎤' },
]

export default function Sidebar({ open, onClose }) {
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
        className={`fixed lg:sticky top-16 lg:top-0 z-40 h-[calc(100vh-4rem)] lg:h-screen w-64 
          bg-white dark:bg-black border-r border-light-border dark:border-dark-border
          transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-accent-500/10 text-accent-500 dark:bg-accent-500/15 dark:text-accent-400'
                  : 'text-gray-600 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-card'}`
              }
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-light-border dark:border-dark-border">
          <p className="text-xs text-gray-400 dark:text-gray-600">
            Music Project Manager v1.0
          </p>
        </div>
      </aside>
    </>
  )
}