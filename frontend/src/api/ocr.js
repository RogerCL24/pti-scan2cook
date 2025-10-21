import client from './client'

export const uploadImageToOcr = (file, mode = 'gemini') => {
  const form = new FormData()
  form.append('image', file)
  return client.post(`/ocr/${mode}`, form, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data)
}
