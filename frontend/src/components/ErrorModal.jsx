import React from 'react'

export default function ErrorModal({ open, onClose, title = 'Error', error }){
  if(!open) return null

  const pretty = (() => {
    try { return JSON.stringify(error, null, 2) }
    catch { return String(error) }
  })()

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg max-w-xl w-full p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">{title}</h3>
          <button className="text-gray-500" onClick={onClose}>Cerrar</button>
        </div>
        <div className="text-sm text-gray-700 whitespace-pre-wrap overflow-auto max-h-72 p-2 bg-gray-50 border rounded">
          {pretty}
        </div>
        <div className="mt-3 text-right">
          <button onClick={onClose} className="px-4 py-2 bg-amber-500 text-white rounded">Aceptar</button>
        </div>
      </div>
    </div>
  )
}
