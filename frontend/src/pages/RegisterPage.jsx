import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import ErrorModal from '../components/ErrorModal'

export default function RegisterPage(){
  const [name,setName]=useState('')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const { register } = useAuth()
  const nav = useNavigate()

  const onSubmit = async (e)=>{
    e.preventDefault()
    setError(null)
    // basic client validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Introduce un email válido')
      return
    }
    if ((password || '').length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)
    try{
      await register(name,email,password)
      nav('/scan')
    }catch(err){
      const msg = err?.status ? (err.data?.error || `HTTP ${err.status}`) : err.message
      setError(String(msg))
      setModalOpen(true)
    }finally{setLoading(false)}
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-amber-700 mb-4">Crear cuenta</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input className="w-full p-3 rounded border" placeholder="Nombre" value={name} onChange={e=>setName(e.target.value)} />
        <input className="w-full p-3 rounded border" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full p-3 rounded border" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <div className="text-xs text-gray-500">La contraseña debe tener al menos 6 caracteres.</div>
        <button className="w-full p-3 bg-amber-500 text-white rounded" disabled={loading}>{loading? 'Registrando...' : 'Crear'}</button>
      </form>
  {error && <div className="mt-3 p-2 bg-red-100 text-red-800 rounded">{error}</div>}
  <ErrorModal open={modalOpen} onClose={() => setModalOpen(false)} title="Register error details" error={error} />
      <p className="mt-4 text-sm">Ya tienes cuenta? <Link to="/login" className="text-amber-600">Entra</Link></p>
    </div>
  )
}
