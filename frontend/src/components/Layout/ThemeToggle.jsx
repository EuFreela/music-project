import React, { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    return (localStorage.getItem('theme') ?? 'dark') === 'dark'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <button
      onClick={() => setDark(!dark)}
      className="btn-ghost !px-2.5 !py-2 text-lg"
      title={dark ? 'Alternar para modo claro' : 'Alternar para modo escuro'}
      aria-label="Alternar tema"
    >
      {dark ? '☀️' : '🌙'}
    </button>
  )
}