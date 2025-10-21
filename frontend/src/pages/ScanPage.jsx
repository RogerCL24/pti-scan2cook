import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadImageToOcr } from '../api/ocr'
import { FaCamera } from 'react-icons/fa'
import ErrorModal from '../components/ErrorModal'

export default function ScanPage(){
  const [file, setFile] = useState(null)
  const [mode, setMode] = useState('gemini')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const MAX_BYTES = 8 * 1024 * 1024 // 8MB
  const nav = useNavigate()

  const onFile = (e) => {
    const f = e.target.files[0]
    setError(null)
    if (f && f.size > MAX_BYTES) {
      setError('El archivo excede el tamaño máximo permitido (8MB). Comprime o recorta la imagen y vuelve a intentarlo.')
      setFile(null)
      return
    }
    setFile(f)
  }

  const onScan = async ()=>{
    if(!file){ alert('Sube una imagen'); return }
    setLoading(true)
    try{
      const res = await uploadImageToOcr(file, mode)
      // Expecting { products } or similar response
      const products = res.products || []
      // store temporary in sessionStorage
      sessionStorage.setItem('ocr_products', JSON.stringify(products))
      nav('/review')
    }catch(err){
      const msg = err?.status ? (err.data?.error || `HTTP ${err.status}`) : err.message
      setError(`Error procesando OCR: ${msg}`)
      setModalOpen(true)
    }finally{setLoading(false)}
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Escanear ticket</h2>
      <div className="space-y-4">
        <label className="block">
          <input type="file" accept="image/*" onChange={onFile} />
        </label>
        <div className="flex gap-2">
          <button className={`px-4 py-2 rounded ${mode==='gemini'? 'bg-amber-500 text-white':'border'}`} onClick={()=>setMode('gemini')}>Gemini</button>
          <button className={`px-4 py-2 rounded ${mode==='regex'? 'bg-amber-500 text-white':'border'}`} onClick={()=>setMode('regex')}>Regex</button>
        </div>
        <button className="w-full p-3 bg-amber-500 text-white rounded" onClick={onScan} disabled={loading}>{loading? 'Procesando...':'Escanear'}</button>
      </div>
      {error && <div className="mt-3 p-2 bg-red-100 text-red-800 rounded">{error}</div>}
      <ErrorModal open={modalOpen} onClose={() => setModalOpen(false)} title="OCR error details" error={error} />
    </div>
  )
}
