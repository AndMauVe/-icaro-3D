// Gestor de usuarios para ICARO 3D
class UsuariosManager {
  constructor() {
    this.usuarios = [];
    this.storageKey = 'icaro3d_usuarios';
  }

  // Cargar usuarios desde JSON y localStorage
  async cargarUsuarios() {
    try {
      // Cargar usuarios base del JSON
      const response = await fetch('Data/usuarios.json');
      const data = await response.json();
      this.usuarios = data.usuarios;

      // Cargar usuarios adicionales del localStorage
      const usuariosGuardados = localStorage.getItem(this.storageKey);
      if (usuariosGuardados) {
        const usuariosLocales = JSON.parse(usuariosGuardados);
        // Filtrar usuarios duplicados por email
        const usuariosUnicos = usuariosLocales.filter(usuarioLocal => 
          !this.usuarios.some(usuarioBase => usuarioBase.email === usuarioLocal.email)
        );
        this.usuarios = [...this.usuarios, ...usuariosUnicos];
      }

      console.log('Usuarios cargados:', this.usuarios.length);
      console.log('Usuarios del JSON:', data.usuarios.length);
      console.log('Usuarios del localStorage:', usuariosGuardados ? JSON.parse(usuariosGuardados).length : 0);
      
      return this.usuarios;
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      // Si falla el JSON, intentar cargar solo del localStorage
      const usuariosGuardados = localStorage.getItem(this.storageKey);
      if (usuariosGuardados) {
        this.usuarios = JSON.parse(usuariosGuardados);
        console.log('Cargando solo usuarios del localStorage:', this.usuarios.length);
      }
      return this.usuarios;
    }
  }

  // Agregar nuevo usuario
  agregarUsuario(nuevoUsuario) {
    // Verificar que el email no exista
    const emailExiste = this.usuarios.find(u => u.email === nuevoUsuario.email);
    if (emailExiste) {
      throw new Error('Este correo electrónico ya está registrado');
    }

    // Generar ID único basado en timestamp
    nuevoUsuario.id = Date.now() + Math.random();
    nuevoUsuario.fecha_registro = new Date().toISOString().split('T')[0];
    nuevoUsuario.activo = true;

    // Agregar a la lista
    this.usuarios.push(nuevoUsuario);

    // Guardar en localStorage
    this.guardarEnLocalStorage(nuevoUsuario);

    console.log('Usuario registrado exitosamente:', nuevoUsuario.email);
    console.log('Total de usuarios en localStorage:', this.obtenerUsuariosLocales().length);

    return nuevoUsuario;
  }

  // Guardar usuario en localStorage
  guardarEnLocalStorage(nuevoUsuario) {
    const usuariosGuardados = localStorage.getItem(this.storageKey) || '[]';
    const usuariosLocales = JSON.parse(usuariosGuardados);
    usuariosLocales.push(nuevoUsuario);
    localStorage.setItem(this.storageKey, JSON.stringify(usuariosLocales));
    
    console.log('Usuario guardado en localStorage:', nuevoUsuario.email);
  }

  // Obtener usuarios del localStorage
  obtenerUsuariosLocales() {
    const usuariosGuardados = localStorage.getItem(this.storageKey);
    return usuariosGuardados ? JSON.parse(usuariosGuardados) : [];
  }

  // Verificar credenciales
  verificarCredenciales(email, password) {
    return this.usuarios.find(u => 
      u.email === email && 
      u.password === password && 
      u.activo
    );
  }

  // Obtener usuario por ID
  obtenerUsuarioPorId(id) {
    return this.usuarios.find(u => u.id == id);
  }

  // Obtener usuario por email
  obtenerUsuarioPorEmail(email) {
    return this.usuarios.find(u => u.email === email);
  }

  // Actualizar usuario
  actualizarUsuario(id, datosActualizados) {
    const index = this.usuarios.findIndex(u => u.id == id);
    if (index !== -1) {
      this.usuarios[index] = { ...this.usuarios[index], ...datosActualizados };
      this.actualizarLocalStorage();
      return this.usuarios[index];
    }
    return null;
  }

  // Actualizar localStorage
  actualizarLocalStorage() {
    const usuariosLocales = this.usuarios.filter(u => u.fecha_registro);
    localStorage.setItem(this.storageKey, JSON.stringify(usuariosLocales));
  }

  // Limpiar usuarios locales (para testing)
  limpiarUsuariosLocales() {
    localStorage.removeItem(this.storageKey);
    this.usuarios = this.usuarios.filter(u => !u.fecha_registro);
    console.log('Usuarios locales limpiados');
  }

  // Verificar estado del localStorage
  verificarEstadoLocalStorage() {
    const usuariosLocales = this.obtenerUsuariosLocales();
    console.log('Estado del localStorage:');
    console.log('- Clave:', this.storageKey);
    console.log('- Usuarios guardados:', usuariosLocales.length);
    console.log('- Usuarios:', usuariosLocales.map(u => ({ email: u.email, nombre: u.nombre })));
    return usuariosLocales;
  }
}

// Exportar para uso global
window.UsuariosManager = UsuariosManager; 