# 🚀 Instrucciones para ejecutar el Backend de ICARO 3D

## ⚠️ IMPORTANTE: Cambiar de Python a Node.js

**NO uses** `python -m http.server 8000` porque ese servidor solo sirve archivos estáticos y no puede manejar las APIs del backend.

## Paso 1: Instalar Node.js

### Opción A: Descarga directa (Recomendada)
1. **Descargar Node.js**: Ve a https://nodejs.org/
2. **Descarga la versión LTS** (la recomendada)
3. **Ejecuta el instalador** y sigue las instrucciones
4. **Reinicia tu terminal/PowerShell** después de la instalación

### Opción B: Verificar si ya tienes Node.js
Abre PowerShell y ejecuta:
```powershell
node --version
npm --version
```
Si ves versiones, ya tienes Node.js instalado.

## Paso 2: Instalar dependencias

1. **Abrir PowerShell** en la carpeta del proyecto:
   - Navega a la carpeta "icaro 3D"
   - Haz clic derecho en la barra de dirección
   - Selecciona "Abrir PowerShell aquí"

2. **Instalar dependencias**:
   ```powershell
   npm install
   ```

## Paso 3: Ejecutar el servidor

### Opción A: Desarrollo (con recarga automática)
```powershell
npm run dev
```

### Opción B: Producción
```powershell
npm start
```

## Paso 4: Acceder a la aplicación

Una vez que el servidor esté ejecutándose, ve a:
- **http://localhost:3000** (en lugar de http://localhost:8000)

## 🔧 Funcionalidades del Backend

### APIs disponibles:
- **GET /api/productos** - Obtener todos los productos
- **POST /api/productos** - Agregar producto con archivos
- **DELETE /api/productos/:id** - Eliminar producto y archivos
- **GET /api/productos/ids-disponibles** - Obtener IDs disponibles

### Carga de archivos:
- **Imágenes**: Se guardan en `Vista_previa/`
- **Modelos 3D**: Se guardan en `Modelos/`
- **Datos**: Se actualizan en `Data/productos.json`

## 🐛 Solución de problemas

### Error: "npm no se reconoce"
- Node.js no está instalado o no está en el PATH
- Reinstala Node.js y reinicia PowerShell

### Error: "puerto 3000 en uso"
- Cambia el puerto en `server.js` línea 8:
  ```javascript
  const PORT = process.env.PORT || 3001; // Cambia 3000 por 3001
  ```

### Error: "No se pueden cargar productos"
- Verifica que el archivo `Data/productos.json` existe
- Verifica que el servidor esté ejecutándose en el puerto correcto

## 📝 Notas importantes

1. **Siempre usa el servidor Node.js** en lugar del servidor Python
2. **El servidor debe estar ejecutándose** para que el panel de administrador funcione
3. **Los archivos se guardan físicamente** en las carpetas correspondientes
4. **El JSON se actualiza automáticamente** cuando agregas/eliminas productos

## 🎯 Próximos pasos

Una vez que tengas el servidor funcionando:
1. Inicia sesión como administrador
2. Ve al panel de administrador
3. Prueba agregar un producto con imagen y archivo GLB
4. Verifica que los archivos se guarden en las carpetas correctas 