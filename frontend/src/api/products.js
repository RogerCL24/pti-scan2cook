import client from './client'

export const importProducts = (products) =>
  client.post('/products/import', { products }).then(r => r.data)
