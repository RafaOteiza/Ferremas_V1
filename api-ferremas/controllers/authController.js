const authService = require('../services/authService');

// Registro de usuario
exports.registrar = async (req, res) => {
  try {
    const { nombre, correo, password, rol = 'cliente' } = req.body;

    const existe = await authService.buscarPorCorreo(correo);
    if (existe) return res.status(400).json({ error: 'Correo ya registrado' });

    const usuario = await authService.registrar({ nombre, correo, password, rol });
    res.status(201).json(usuario);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { token } = await authService.login(req.body);
    res.status(200).json({ token });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

// Perfil
exports.perfil = async (req, res) => {
  try {
    const usuario = await authService.obtenerPerfil(req.usuario.id);
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

// Cambiar contraseña
exports.cambiarPassword = async (req, res) => {
  try {
    const userId = req.usuario.id; // Usar req.usuario.id
    const { passwordActual, passwordNueva } = req.body;
    if (!passwordActual || !passwordNueva) {
      return res.status(400).json({ error: 'Faltan campos requeridos.' });
    }
    const result = await authService.cambiarPassword(userId, passwordActual, passwordNueva);
    if (result.success) {
      return res.status(200).json({ message: 'Contraseña actualizada con éxito.' });
    } else {
      return res.status(400).json({ error: result.error });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Error en el servidor.' });
  }
};
