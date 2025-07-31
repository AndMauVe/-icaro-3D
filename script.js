// Función para cargar y mostrar productos
async function cargarProductos() {
  try {
    const response = await fetch('Data/productos.json');
    const data = await response.json();
    
    const contenedor = document.getElementById('productos-container');
    
    data.productos.forEach(producto => {
      const productoElement = crearElementoProducto(producto);
      contenedor.appendChild(productoElement);
    });
  } catch (error) {
    console.error('Error al cargar productos:', error);
  }
}

// Función para crear el elemento HTML de cada producto
function crearElementoProducto(producto) {
  const productoDiv = document.createElement('div');
  productoDiv.className = 'producto-card';
  
  productoDiv.innerHTML = `
    <div class="producto-imagen">
      <img src="${producto.imagen}" alt="${producto.nombre}" class="preview-image" />
    </div>
    <div class="producto-info">
      <h3>${producto.nombre}</h3>
      <p class="producto-descripcion">${producto.descripcion}</p>
      <div class="producto-detalles">
        <span class="categoria">${producto.categoria}</span>
        <span class="precio">${producto.precio}</span>
      </div>
      <button class="ver-3d-btn" onclick="verModelo3D(${producto.id})">
        Ver Modelo 3D
      </button>
    </div>
  `;
  
  return productoDiv;
}

// Función para ver el modelo 3D
function verModelo3D(productoId) {
  // Redirigir a la página del modelo 3D con el ID del producto
  window.location.href = `modelo3d.html?id=${productoId}`;
}

// Cargar productos cuando la página esté lista
document.addEventListener('DOMContentLoaded', cargarProductos);
  