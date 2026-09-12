import React, { useEffect, useRef, useState } from 'react'
import api from '../services/api.js'
import SecureImage from '../components/UI/SecureImage.jsx'

const DICEBEAR_BASE = 'https://api.dicebear.com/9.x/clay/svg'
const AVATAR_SEEDS = ['Lia', 'Maya', 'Nina', 'Aria', 'Zoe', 'Bella', 'Luna', 'Ivy', 'Mila', 'Sofia']

function dicebearUrl(seed) {
  return `${DICEBEAR_BASE}?seed=${encodeURIComponent(seed)}`
}

export default function Account() {
  const [profile, setProfile] = useState(null)

  // Avatar
  const [selectedSeed, setSelectedSeed] = useState(null)
  const [avatarMsg, setAvatarMsg] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

  // E-mail
  const [email, setEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')
  const [emailMsg, setEmailMsg] = useState(null)

  // Senha
  const [curPass, setCurPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [passMsg, setPassMsg] = useState(null)

  useEffect(() => {
    api.get('/auth/me')
      .then(({ data }) => {
        setProfile(data)
        setEmail(data.email)
      })
      .catch(() => {})
  }, [])

  const showAvatarMsg = (type, text) => {
    setAvatarMsg({ type, text })
    setTimeout(() => setAvatarMsg(null), 4000)
  }

  // Notifica a Navbar (e outros consumidores) que o avatar/perfil mudou
  const notifyProfileUpdated = () => {
    window.dispatchEvent(new CustomEvent('admin-profile-updated'))
  }
  const showEmailMsg = (type, text) => {
    setEmailMsg({ type, text })
    setTimeout(() => setEmailMsg(null), 4000)
  }
  const showPassMsg = (type, text) => {
    setPassMsg({ type, text })
    setTimeout(() => setPassMsg(null), 4000)
  }

  // ---------- Avatar ----------
  const saveSelectedSeed = async () => {
    if (!selectedSeed) return
    try {
      const { data } = await api.put('/auth/avatar', { avatar_seed: selectedSeed })
      setProfile(data)
      setSelectedSeed(null)
      notifyProfileUpdated()
      showAvatarMsg('success', 'Avatar atualizado!')
    } catch (err) {
      showAvatarMsg('error', err.response?.data?.detail || 'Erro ao salvar avatar')
    }
  }

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) {
      e.target.value = ''
      return
    }
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const { data } = await api.post('/auth/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setProfile(data)
      setSelectedSeed(null)
      notifyProfileUpdated()
      showAvatarMsg('success', 'Avatar atualizado!')
    } catch (err) {
      showAvatarMsg('error', err.response?.data?.detail || 'Erro ao enviar imagem')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleRemoveAvatar = async () => {
    try {
      const { data } = await api.put('/auth/avatar', { avatar_seed: null })
      setProfile(data)
      setSelectedSeed(null)
      showAvatarMsg('success', 'Avatar removido')
    } catch (err) {
      showAvatarMsg('error', err.response?.data?.detail || 'Erro ao remover avatar')
    }
  }

  // ---------- E-mail ----------
  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    try {
      const { data } = await api.put('/auth/email', { email, password: emailPassword })
      setProfile((p) => ({ ...p, email: data.email }))
      localStorage.setItem('adminEmail', data.email)
      setEmailPassword('')
      showEmailMsg('success', 'E-mail alterado com sucesso!')
    } catch (err) {
      showEmailMsg('error', err.response?.data?.detail || 'Erro ao alterar e-mail')
    }
  }

  // ---------- Senha ----------
  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (newPass !== confirmPass) {
      showPassMsg('error', 'A confirmação não confere com a nova senha')
      return
    }
    try {
      await api.put('/auth/password', { current_password: curPass, new_password: newPass })
      setCurPass('')
      setNewPass('')
      setConfirmPass('')
      showPassMsg('success', 'Senha alterada com sucesso!')
    } catch (err) {
      showPassMsg('error', err.response?.data?.detail || 'Erro ao alterar senha')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">
          👤 Minha conta
        </h1>
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
          Gerencie sua conta de administrador
        </p>
      </div>

      {/* ---------- Avatar ---------- */}
      <section className="card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-light-text dark:text-dark-text">Avatar</h2>

        <div className="flex items-center gap-4">
          {profile?.avatar_seed ? (
            <img
              src={dicebearUrl(profile.avatar_seed)}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : profile?.avatar_path ? (
            <SecureImage
              src="/api/auth/avatar"
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover"
              fallback="👤"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-accent-500 text-white flex items-center justify-center text-4xl font-semibold">
              {profile?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
          )}
          <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            <p className="font-medium text-light-text dark:text-dark-text">
              {profile?.email || 'Carregando...'}
            </p>
            <p>Escolha um avatar pré-definido abaixo ou envie uma imagem sua.</p>
          </div>
        </div>

        <div>
          <p className="label">Avatares pré-definidos (DiceBear Lorelei)</p>
          <div className="grid grid-cols-5 gap-2 mt-2">
            {AVATAR_SEEDS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSelectedSeed(s)}
                title={s}
                className={`rounded-full overflow-hidden ring-2 transition ${
                  selectedSeed === s
                    ? 'ring-accent-500'
                    : 'ring-transparent hover:ring-gray-300 dark:hover:ring-gray-700'
                }`}
              >
                <img src={dicebearUrl(s)} alt={s} className="w-full aspect-square object-cover" />
              </button>
            ))}
          </div>
          <button
            type="button"
            className="btn-primary mt-3"
            disabled={!selectedSeed}
            onClick={saveSelectedSeed}
          >
            Usar avatar selecionado
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
          <button
            type="button"
            className="btn-secondary"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? 'Enviando...' : '📷 Enviar minha imagem'}
          </button>
          <button type="button" className="btn-ghost" onClick={handleRemoveAvatar}>
            Remover avatar
          </button>
        </div>

        {avatarMsg && (
          <div
            className={`text-sm px-3 py-2 rounded-lg ${
              avatarMsg.type === 'success'
                ? 'bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400'
                : 'bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400'
            }`}
          >
            {avatarMsg.text}
          </div>
        )}
      </section>

      {/* ---------- E-mail ---------- */}
      <section className="card p-6">
        <h2 className="text-lg font-semibold text-light-text dark:text-dark-text mb-4">
          Trocar e-mail
        </h2>
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="account-email">Novo e-mail</label>
            <input
              id="account-email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="account-email-pass">Senha atual</label>
            <input
              id="account-email-pass"
              type="password"
              className="input"
              value={emailPassword}
              onChange={(e) => setEmailPassword(e.target.value)}
              placeholder="Confirme sua senha atual"
              autoComplete="current-password"
              required
            />
          </div>
          {emailMsg && (
            <div
              className={`text-sm px-3 py-2 rounded-lg ${
                emailMsg.type === 'success'
                  ? 'bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400'
                  : 'bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400'
              }`}
            >
              {emailMsg.text}
            </div>
          )}
          <button type="submit" className="btn-primary">Salvar e-mail</button>
        </form>
      </section>

      {/* ---------- Senha ---------- */}
      <section className="card p-6">
        <h2 className="text-lg font-semibold text-light-text dark:text-dark-text mb-4">
          Trocar senha
        </h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="account-cur-pass">Senha atual</label>
            <input
              id="account-cur-pass"
              type="password"
              className="input"
              value={curPass}
              onChange={(e) => setCurPass(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="account-new-pass">Nova senha</label>
            <input
              id="account-new-pass"
              type="password"
              className="input"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="account-confirm-pass">Confirmar nova senha</label>
            <input
              id="account-confirm-pass"
              type="password"
              className="input"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
          {passMsg && (
            <div
              className={`text-sm px-3 py-2 rounded-lg ${
                passMsg.type === 'success'
                  ? 'bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400'
                  : 'bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400'
              }`}
            >
              {passMsg.text}
            </div>
          )}
          <button type="submit" className="btn-primary">Salvar senha</button>
        </form>
      </section>
    </div>
  )
}