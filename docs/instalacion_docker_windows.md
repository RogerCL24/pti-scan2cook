# Instalación docker desktop en Windows

Este documento explica paso a paso cómo instalar Docker Desktop en Windows y cómo resolver los problemas más comunes que pueden surgir durante la instalación.

## 1. Comprobar el tipo de procesador
Antes de descargar Docker, debes saber si tu ordenador es AMD64 (la mayoría de ordenadores de sobremesa o portátiles comunes) o ARM64 (como algunos portátiles con procesador Snapdragon o Apple M1/M2 con Windows ARM).

Para comprobarlo:

1. Pulsa Windows + R
2. Escribe cmd y presiona Enter.
3. En la ventana de comandos, escribe:

→ Si aparece algo como AMD Ryzen o Intel i5/i7/i9, es AMD64.
→ Si aparece algo como Snapdragon, es ARM64.

## 2. Descargar Docker Desktop
Ve a la página oficial de descarga: [link](https://www.docker.com/products/docker-desktop/)

Selecciona la versión correspondiente según tu arquitectura (AMD64 o ARM64).

## 3. Requisitos mínimos de Windows
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

## 4. Actualizar Windows manualmente (si tu versión es antigua)
1. Usad windows Update. Configuracion -> Buscador: "Buscar actualizaciones"

Si Windows Update no ofrece nuevas versiones (por ejemplo, si el sistema no es oficial o está bloqueado), puedes actualizar manualmente desde la [página](https://www.microsoft.com/es-es/software-download/windows10) oficial de Microsoft:

1. Entra al enlace.
2. Haz clic en “Actualizar ahora”.
3. Se descargará el Asistente de actualización de Windows 10.
4. Ejecútalo y sigue los pasos para actualizar a la versión 22H2 (o superior).

> [!NOTE] 
> Este proceso tarda entre 30 y 60 minutos dependiendo del equipo. 
> Cuando llegue al 80% más o menos se os cerrará la ventana y se ejecutará en segundo plano, podeis ver el progreso al darle ^ y despues al icono en la barra de tareas.








