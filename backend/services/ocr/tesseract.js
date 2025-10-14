import { createWorker } from 'tesseract.js';

// función principal para leer una imagen
export async function recognizeText(buffer) {
  //crea el "worker" (intérprete OCR)
  const worker = await createWorker('spa'); // usa idioma español

  //ejecuta el reconocimiento
  const { data } = await worker.recognize(buffer);

  //cierra el worker
  await worker.terminate();

  //devuelve el texto reconocido
  return data.text;
}

//luego añadiremos sharp que limpia imagenes, de momento esta asi de simple que solo  lee una imagen
