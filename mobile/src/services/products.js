import api from './api';

/**
 * Obtener todos los productos del usuario
 * @returns {Promise<Array>}
 */
export const getUserProducts = async () => {
  try {
    const response = await api.get('/products');
    return response.data || [];
  } catch (error) {
    console.error('❌ Get Products Error:', error);
    throw error;
  }
};

/**
 * Guardar múltiples productos (desde OCR)
 * @param {Array} products - Lista de productos a guardar
 * @returns {Promise}
 */
export const saveProducts = async (products) => {
  try {
    const response = await api.post('/products/import', { products });
    return response.data;
  } catch (error) {
    console.error('❌ Save Products Error:', error);
    throw error;
  }
};

/**
 * Eliminar un producto
 * @param {number} productId
 * @returns {Promise}
 */
export const deleteProduct = async (productId) => {
  try {
    await api.delete(`/products/${productId}`);
  } catch (error) {
    console.error('❌ Delete Product Error:', error);
    throw error;
  }
};

/**
 * Actualizar un producto
 * @param {number} productId
 * @param {object} data - Datos a actualizar
 * @returns {Promise}
 */
export const updateProduct = async (productId, data) => {
  try {
    const response = await api.put(`/products/${productId}`, data);
    return response.data;
  } catch (error) {
    console.error('❌ Update Product Error:', error);
    throw error;
  }
};
