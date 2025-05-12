const { db } = require('./firebase');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const usuariosRef = db.collection('usuarios');

// Buscar por correo
exports.buscarPorCorreo = async (correo) => {
  const snapshot = await usuariosRef.where('correo', '==', correo).get();
  return snapshot.empty ? null : snapshot.docs[0];
};

// Registro con rol
exports.registrar = async ({ nombre, correo, password, rol = 'cliente' }) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const usuario = { nombre, correo, password: hashedPassword, rol };
  const docRef = await usuariosRef.add(usuario);
  return { id: docRef.id, nombre, correo, rol };
};

// Login
exports.login = async ({ correo, password }) => {
  const userDoc = await this.buscarPorCorreo(correo);
  if (!userDoc) throw new Error('Credenciales inválidas');

  const user = userDoc.data();
  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error('Credenciales inválidas');

  const token = jwt.sign(
    {
      id: userDoc.id,
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol
    },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );

  return { token };
};

// Perfil
exports.obtenerPerfil = async (id) => {
  const doc = await usuariosRef.doc(id).get();
  return doc.exists ? { id: doc.id, ...doc.data(), password: undefined } : null;
};

// Cambiar contraseña
exports.cambiarPassword = async (userId, passwordActual, passwordNueva) => {
  // 1. Buscar usuario por userId
  const userRef = db.collection('usuarios').doc(userId);
  const userDoc = await userRef.get();
  if (!userDoc.exists) return { success: false, error: 'Usuario no encontrado.' };
  const user = userDoc.data();

  // 2. Validar password actual
  const match = await bcrypt.compare(passwordActual, user.password);
  if (!match) return { success: false, error: 'Contraseña actual incorrecta.' };

  // 3. Hashear y guardar la nueva contraseña
  const hashNueva = await bcrypt.hash(passwordNueva, 10);
  await userRef.update({ password: hashNueva });

  return { success: true };
};
