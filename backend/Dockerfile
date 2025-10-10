# Imagen base
FROM node:20

# Carpeta de trabajo dentro del contenedor
WORKDIR /app

# Copiamos los archivos de dependencias
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el resto del código
COPY . .

# Puerto del servidor
EXPOSE 3000

# Comando para arrancar el backend
CMD ["node", "server.js"]
