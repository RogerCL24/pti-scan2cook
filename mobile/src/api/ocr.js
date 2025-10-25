import client from './client';

export const uploadImageToOcr = async (imageUri, mode = 'gemini') => {
  console.log('>> Uploading image to OCR');
  console.log('   URI:', imageUri);
  console.log('   Mode:', mode);

  // Crear FormData correctamente para React Native
  const formData = new FormData();
  
  // IMPORTANTE: En React Native, FormData necesita este formato específico
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'ticket.jpg',
  });

  console.log('>> FormData created');

  const response = await client.post(`/ocr/${mode}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 60000, // 60 segundos
    transformRequest: (data, headers) => {
      // No transformar el FormData, dejarlo como está
      return data;
    },
  });

  console.log('>> OCR response:', response.data);
  return response.data;
};