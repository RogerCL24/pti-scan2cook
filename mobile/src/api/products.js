import client from './client';

export const importProducts = async (products) => {
  console.log('>> Importing products:', products);
  
  const response = await client.post('/products/import', { 
    products 
  });
  
  console.log('>> Import response:', response.data);
  return response.data;
};

// Otras funciones que puedas necesitar:

export const getProducts = async () => {
  const response = await client.get('/products');
  return response.data;
};

export const deleteProduct = async (productId) => {
  const response = await client.delete(`/products/${productId}`);
  return response.data;
};

export const updateProduct = async (productId, data) => {
  const response = await client.put(`/products/${productId}`, data);
  return response.data;
};