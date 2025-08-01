const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Servir archivos estáticos desde el directorio raíz

// Configuración de multer para manejo de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath;
    
    // Determinar la carpeta de destino según el tipo de archivo
    if (file.fieldname === 'imagen') {
      uploadPath = 'Vista_previa/';
    } else if (file.fieldname === 'archivo_3d') {
      uploadPath = 'Modelos/';
    } else {
      uploadPath = 'uploads/';
    }
    
    // Crear la carpeta si no existe
    fs.ensureDirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Mantener el nombre original del archivo
    cb(null, file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Validar tipos de archivo
    if (file.fieldname === 'imagen') {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Solo se permiten archivos de imagen'), false);
      }
    } else if (file.fieldname === 'archivo_3d') {
      if (!file.originalname.endsWith('.glb')) {
        return cb(new Error('Solo se permiten archivos .glb'), false);
      }
    }
    cb(null, true);
  }
});

// Función para cargar productos desde el JSON
async function cargarProductosDesdeJSON() {
  try {
    const data = await fs.readJson('Data/productos.json');
    return data.productos || [];
  } catch (error) {
    console.error('Error al cargar productos desde JSON:', error);
    return [];
  }
}

// Función para guardar productos en el JSON
async function guardarProductosEnJSON(productos) {
  try {
    await fs.writeJson('Data/productos.json', { productos }, { spaces: 2 });
    return true;
  } catch (error) {
    console.error('Error al guardar productos en JSON:', error);
    return false;
  }
}

// API: Obtener todos los productos
app.get('/api/productos', async (req, res) => {
  try {
    const productos = await cargarProductosDesdeJSON();
    res.json({ productos });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// API: Obtener IDs disponibles
app.get('/api/productos/ids-disponibles', async (req, res) => {
  try {
    const productos = await cargarProductosDesdeJSON();
    const idsOcupados = productos.map(p => p.id);
    const idsDisponibles = [];
    
    // Buscar IDs disponibles desde 1 hasta 100
    for (let i = 1; i <= 100; i++) {
      if (!idsOcupados.includes(i)) {
        idsDisponibles.push(i);
      }
    }
    
    res.json({
      idsOcupados: idsOcupados.sort((a, b) => a - b),
      idsDisponibles: idsDisponibles.slice(0, 20), // Máximo 20 IDs disponibles
      totalProductos: productos.length
    });
  } catch (error) {
    console.error('Error al obtener IDs disponibles:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// API: Agregar nuevo producto
app.post('/api/productos', upload.fields([
  { name: 'imagen', maxCount: 1 },
  { name: 'archivo_3d', maxCount: 1 }
]), async (req, res) => {
  try {
    const { nombre, categoria, descripcion, precio, id } = req.body;
    const files = req.files;
    
    // Validaciones
    if (!nombre || !categoria || !descripcion || !precio || !id) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    
    if (!files.imagen || !files.archivo_3d) {
      return res.status(400).json({ error: 'Se requieren tanto la imagen como el archivo 3D' });
    }
    
    // Cargar productos existentes
    const productos = await cargarProductosDesdeJSON();
    
    // Verificar si el ID ya existe
    if (productos.find(p => p.id === parseInt(id))) {
      return res.status(400).json({ error: 'Ya existe un producto con ese ID' });
    }
    
    // Crear nuevo producto
    const nuevoProducto = {
      id: parseInt(id),
      nombre,
      categoria,
      descripcion,
      precio,
      imagen: `Vista_previa/${files.imagen[0].originalname}`,
      archivo_3d: `Modelos/${files.archivo_3d[0].originalname}`
    };
    
    // Agregar a la lista
    productos.push(nuevoProducto);
    
    // Guardar en JSON
    const guardado = await guardarProductosEnJSON(productos);
    if (!guardado) {
      return res.status(500).json({ error: 'Error al guardar el producto' });
    }
    
    console.log('Producto agregado:', nuevoProducto);
    res.json({ 
      success: true, 
      producto: nuevoProducto,
      message: 'Producto agregado exitosamente' 
    });
    
  } catch (error) {
    console.error('Error al agregar producto:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
});

// API: Eliminar producto
app.delete('/api/productos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const productos = await cargarProductosDesdeJSON();
    
    const productoAEliminar = productos.find(p => p.id === id);
    if (!productoAEliminar) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    // Eliminar archivos físicos
    try {
      if (await fs.pathExists(productoAEliminar.imagen)) {
        await fs.remove(productoAEliminar.imagen);
        console.log(`Archivo eliminado: ${productoAEliminar.imagen}`);
      }
      
      if (await fs.pathExists(productoAEliminar.archivo_3d)) {
        await fs.remove(productoAEliminar.archivo_3d);
        console.log(`Archivo eliminado: ${productoAEliminar.archivo_3d}`);
      }
    } catch (fileError) {
      console.error('Error al eliminar archivos:', fileError);
      // Continuar aunque falle la eliminación de archivos
    }
    
    // Eliminar de la lista
    const productosActualizados = productos.filter(p => p.id !== id);
    
    // Guardar en JSON
    const guardado = await guardarProductosEnJSON(productosActualizados);
    if (!guardado) {
      return res.status(500).json({ error: 'Error al guardar los cambios' });
    }
    
    console.log(`Producto eliminado: ${productoAEliminar.nombre}`);
    res.json({ 
      success: true, 
      producto: productoAEliminar,
      message: 'Producto eliminado exitosamente' 
    });
    
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para servir el archivo index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Manejo de errores
app.use((error, req, res, next) => {
  console.error('Error del servidor:', error);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor ICARO 3D ejecutándose en http://localhost:${PORT}`);
  console.log(`📁 Archivos estáticos servidos desde: ${__dirname}`);
  console.log(`📊 APIs disponibles:`);
  console.log(`   GET  /api/productos`);
  console.log(`   POST /api/productos`);
  console.log(`   DELETE /api/productos/:id`);
  console.log(`   GET  /api/productos/ids-disponibles`);
}); 