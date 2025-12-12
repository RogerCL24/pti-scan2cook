// Encuentra tu IP local:
// - Linux/Mac: hostname -I | awk '{print $1}'
// - Windows: ipconfig
// Busca algo como 192.168.X.X

export const API_BASE_URL = 'http://YOUR_LOCAL_IP:3000';

// Ejemplo:
// export const API_BASE_URL = 'http://192.168.1.45:3000';

// IMPORTANTE: Cada persona debe poner SU propia IP cuando pruebe en su móvil
