import React from 'react'
import { Link } from 'react-router-dom'

export default function Header(){
  return (
    <header className="p-4 border-b bg-white">
      <div className="max-w-3xl mx-auto flex justify-between items-center">
        <Link to="/" className="font-bold text-amber-700">Scan2Cook</Link>
        <nav className="space-x-3">
          <Link to="/scan" className="text-sm">Escanear</Link>
          <Link to="/review" className="text-sm">Revisar</Link>
        </nav>
      </div>
    </header>
  )
}
