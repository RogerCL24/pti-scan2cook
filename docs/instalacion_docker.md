# Guía de instalación de Docker (Linux y Windows)
Esta guía explica cómo instalar Docker y Docker Compose en Linux (**recomendado**) y en Windows (alternativa).

## Por qué usamos Docker 🐳
Docker permite que todo el equipo trabaje con el mismo entorno, sin depender del sistema operativo de cada uno.
Ejemplo: si en un PC PostgreSQL está en la versión 14 y en otro en la 16, puede fallar.
Con Docker, todos usan el mismo contenedor exacto, garantizando compatibilidad total.

Ventajas:

- Entorno idéntico para todos.

- No necesita instalar PostgreSQL ni Node globalmente.

- Despliegue instantáneo con docker-compose up.

- Aísla servicios (base de datos, backend, OCR…).

## 1. Instalación recomendada: Linux (Debian / Ubuntu)
Instalar Docker en Linux es más sencillo, más estable y sin limitaciones.
Si usas Debian, Ubuntu o cualquier distribución basada en ellas, sigue estos pasos:

### Paso 1. Actualizar el sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### Paso 2. Instalar Docker y Docker Compose
```bash
sudo apt install docker.io docker-compose -y
```
Esto instalará tanto Docker como Docker Compose (gestor de múltiples contenedores).

### Paso 3. Habilitar y arrancar el servicio
```bash
sudo systemctl enable docker
sudo systemctl start docker
```

Verifica que Docker está activo:
```bash
sudo systemctl status docker
```
Si ves la línea Active: active (running), está funcionando correctamente.

### Paso 4. Comprobar instalación
Ejecuta:
```bash
sudo docker --version
sudo docker-compose --version
```

Deberías ver las versiones instaladas.
Luego prueba que Docker corre correctamente:

```bash
sudo docker run hello-world
```
Si ves el mensaje de bienvenida de Docker, ¡todo está bien! ✅

### Paso 5. Usar Docker sin “sudo”
Para evitar tener que escribir “sudo” en cada comando:
```bash
sudo usermod -aG docker $USER
```
Luego cierra sesión y vuelve a entrar.
Después podrás usar comandos como `docker ps` sin necesidad de sudo.

## 2. Instalación alternativa: Windows
### 1. Comprobar el tipo de procesador
Antes de descargar Docker, debes saber si tu ordenador es AMD64 (la mayoría de ordenadores de sobremesa o portátiles comunes) o ARM64 (como algunos portátiles con procesador Snapdragon o Apple M1/M2 con Windows ARM).

Para comprobarlo:

1. Pulsa Windows + R
2. Escribe cmd y presiona Enter.
3. En la ventana de comandos, escribe:

→ Si aparece algo como AMD Ryzen o Intel i5/i7/i9, es AMD64.
→ Si aparece algo como Snapdragon, es ARM64.

### 2. Descargar Docker Desktop
Ve a la página oficial de descarga: [link](https://www.docker.com/products/docker-desktop/)

Selecciona la versión correspondiente según tu arquitectura (AMD64 o ARM64).

### 3. Requisitos mínimos de Windows
Docker Desktop solo funciona en:

- Windows 10 versión 21H2 o superior
- Windows 11
- Compilación 19044.2846 o superior
- Virtualización activada en BIOS

Para comprobar tu versión:
1. Pulsa Windows + R
2. Escribe winver
3. Verás una ventana con la versión y compilación (por ejemplo, Versión 21H1 (Compilación 19043.2130))ç

Si tienes algo menor (como 21H1 o 19043.XXXX), Docker no podrá instalarse.

### 4. Actualizar Windows manualmente (si tu versión es antigua)
1. Usad windows Update. Configuracion -> Buscador: "Buscar actualizaciones"

Si Windows Update no ofrece nuevas versiones (por ejemplo, si el sistema no es oficial o está bloqueado), puedes actualizar manualmente desde la [página](https://www.microsoft.com/es-es/software-download/windows10) oficial de Microsoft:

1. Entra al enlace.
2. Haz clic en “Actualizar ahora”.
3. Se descargará el Asistente de actualización de Windows 10.
4. Ejecútalo y sigue los pasos para actualizar a la versión 22H2 (o superior).

> [!NOTE] 
> Este proceso tarda entre 30 y 60 minutos dependiendo del equipo. 
> Cuando llegue al 80% más o menos se os cerrará la ventana y se ejecutará en segundo plano, podeis ver el progreso al darle ^ y despues al icono en la barra de tareas.








