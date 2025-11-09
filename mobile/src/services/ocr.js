import api from './api';

/**
 * Sube una imagen al servicio OCR del backend
 * @param {string} imageUri - URI local de la imagen
 * @param {string} mode - Modo OCR: 'gemini' o 'regex'
 * @returns {Promise<{products: Array}>}
 */
export const uploadImageToOcr = async (imageUri, mode = 'gemini') => {
  try {
    console.log('>> Uploading image to OCR');
    console.log('   URI:', imageUri);
    console.log('   Mode:', mode);

    // Crear FormData para React Native
    const formData = new FormData();

    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'ticket.jpg',
    });

    console.log('>> FormData created');

    // Usar el cliente api.js con la ruta correcta: /ocr/gemini o /ocr/regex
    const response = await api.post(`/ocr/${mode}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 segundos
      transformRequest: (data) => data, // No transformar FormData
    });

    console.log('>> OCR response:', response.data);
    return response.data;
  } catch (error) {
    console.error('OCR Service Error:', error);

    if (error.response) {
      throw {
        status: error.response.status,
        data: error.response.data,
        message: error.response.data?.error || `HTTP ${error.response.status}`,
      };
    }

    throw error;
  }
};

/**
 * Obtiene el historial de escaneos (requiere implementar endpoint en backend)
 * @returns {Promise<Array>}
 */
export const getScanHistory = async () => {
  try {
    const response = await api.get('/ocr/history');
    return response.data.scans || [];
  } catch (error) {
    console.error('Get Scan History Error:', error);
    throw error;
  }
};
