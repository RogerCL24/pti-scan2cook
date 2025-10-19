import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import ErrorModal from '../components/ErrorModal'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const { login } = useAuth()
  const nav = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      setError(null)
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('Introduce un email válido')
        setLoading(false)
        return
      }
      await login(email, password)
      nav('/scan')
    } catch (err) {
      const msg = err?.status ? (err.data?.error || `HTTP ${err.status}`) : err.message
      setError(String(msg))
      setModalOpen(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-amber-700 mb-4">Scan2Cook</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input className="w-full p-3 rounded border" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full p-3 rounded border" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="w-full p-3 bg-amber-500 text-white rounded" disabled={loading}>{loading? 'Entrando...' : 'Entrar'}</button>
      </form>
  {error && <div className="mt-3 p-2 bg-red-100 text-red-800 rounded">{error}</div>}
  <ErrorModal open={modalOpen} onClose={() => setModalOpen(false)} title="Login error details" error={error} />
      <p className="mt-4 text-sm">No tienes cuenta? <Link to="/register" className="text-amber-600">Regístrate</Link></p>
    </div>
  )
}
