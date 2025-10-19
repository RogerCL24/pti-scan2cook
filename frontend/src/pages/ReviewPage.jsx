import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { importProducts } from '../api/products'

const DEFAULT_CATEGORY = (name) => {
  const low = name.toLowerCase()
  const nevera = ['leche','queso','yogur','tomate','huevos']
  const despensa = ['pasta','arroz','harina','aceite','legumbres']
  const congelador = ['pollo','carne','pescado','helado']
  if (nevera.some(w=>low.includes(w))) return 'nevera'
  if (congelador.some(w=>low.includes(w))) return 'congelador'
  return 'despensa'
}

export default function ReviewPage(){
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    const p = JSON.parse(sessionStorage.getItem('ocr_products') || '[]')
    // normalize incoming product shape
    const normalized = p.map(item => ({
      name: item.name || String(item),
      quantity: item.quantity || 1,
      category: item.category || DEFAULT_CATEGORY(item.name || String(item))
    }))
    setProducts(normalized)
  },[])

  const update = (i, payload) => {
    setProducts(prev => prev.map((it, idx)=> idx===i? {...it,...payload}: it))
  }

  const remove = (i) => setProducts(prev => prev.filter((_,idx)=>idx!==i))

  const confirm = async ()=>{
    setLoading(true)
    try{
      await importProducts(products)
      alert('Productos importados')
      sessionStorage.removeItem('ocr_products')
      window.location.href='/'
    }catch(err){
      alert('Error al guardar productos')
    }finally{setLoading(false)}
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-3">Revisar productos</h2>
      <div className="space-y-2">
        {products.map((p, i)=> (
          <motion.div key={i} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="p-3 rounded border bg-white flex items-center justify-between">
            <div className="flex-1">
              <input className="w-full" value={p.name} onChange={(e)=>update(i,{name:e.target.value})} />
              <div className="text-sm text-gray-500">Categoria: 
                <select value={p.category} onChange={(e)=>update(i,{category:e.target.value})}>
                  <option value="nevera">Nevera</option>
                  <option value="despensa">Despensa</option>
                  <option value="congelador">Congelador</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-3">
              <input className="w-16 p-1 border rounded" type="number" value={p.quantity} onChange={(e)=>update(i,{quantity:parseInt(e.target.value||1)})} />
              <button className="text-red-500" onClick={()=>remove(i)}>Eliminar</button>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="mt-4">
        <button className="w-full p-3 bg-amber-500 text-white rounded" onClick={confirm} disabled={loading}>{loading? 'Guardando...':'Confirmar'}</button>
      </div>
    </div>
  )
}
