const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Usaremos bcryptjs para simular hashing
const { db } = require('../services/firebase'); // Importar la instancia de db de Firebase

// @desc    Obtener todos los usuarios
// @route   GET /api/users
// @access  Admin
exports.getAllUsers = async (req, res) => {
  try {
    const usersRef = db.collection('usuarios');
    const allowedRoles = ['admin', 'bodeguero', 'contador', 'vendedor'];
    const snapshot = await usersRef.where('rol', 'in', allowedRoles).get();
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // No enviar las contraseñas en la respuesta
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    res.status(200).json(usersWithoutPasswords);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener usuarios.' });
  }
};

// @desc    Obtener un usuario por ID
// @route   GET /api/users/:id
// @access  Admin
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const userRef = await db.collection('usuarios').doc(userId).get();

    if (!userRef.exists) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const user = { id: userRef.id, ...userRef.data() };
    // No enviar la contraseña en la respuesta
    const { password, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Error al obtener usuario por ID:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener usuario.' });
  }
};

// @desc    Crear un nuevo usuario
// @route   POST /api/users
// @access  Admin
exports.createUser = async (req, res) => {
  const { nombre, correo, password, rol } = req.body;

  if (!nombre || !correo || !password || !rol) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
  }

  // Validar el formato del correo
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(correo)) {
    return res.status(400).json({ message: 'Formato de correo inválido.' });
  }

  try {
    // Verificar si el correo ya existe
    const existingUser = await db.collection('usuarios').where('correo', '==', correo).limit(1).get();
    if (!existingUser.empty) {
      return res.status(400).json({ message: 'El correo ya está registrado.' });
    }

    // Validar que el rol sea uno de los permitidos
    const allowedRoles = ['admin', 'bodeguero', 'contador', 'vendedor'];
    if (!allowedRoles.includes(rol)) {
      return res.status(400).json({ message: 'Rol de usuario inválido.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUserRef = await db.collection('usuarios').add({
      nombre,
      correo,
      rol,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    });

    const newUser = { id: newUserRef.id, nombre, correo, rol };
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor al crear usuario.' });
  }
};

// @desc    Actualizar un usuario
// @route   PUT /api/users/:id
// @access  Admin
exports.updateUser = async (req, res) => {
  const { nombre, correo, password, rol } = req.body;
  const userId = req.params.id;

  try {
    const userRef = db.collection('usuarios').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Validar el formato del correo si se proporciona
    if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      return res.status(400).json({ message: 'Formato de correo inválido.' });
    }

    // Verificar si el nuevo correo ya existe en otro usuario
    if (correo && userDoc.data().correo !== correo) {
      const existingUser = await db.collection('usuarios').where('correo', '==', correo).limit(1).get();
      if (!existingUser.empty) {
        return res.status(400).json({ message: 'El correo ya está registrado por otro usuario.' });
      }
    }

    // Validar que el rol sea uno de los permitidos si se proporciona
    const allowedRoles = ['admin', 'bodeguero', 'contador', 'vendedor'];
    if (rol && !allowedRoles.includes(rol)) {
      return res.status(400).json({ message: 'Rol de usuario inválido.' });
    }

    const updatedFields = {};
    if (nombre) updatedFields.nombre = nombre;
    if (correo) updatedFields.correo = correo;
    if (rol) updatedFields.rol = rol;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updatedFields.password = await bcrypt.hash(password, salt);
    }

    await userRef.update(updatedFields);

    // Obtener el usuario actualizado para devolverlo (sin la contraseña)
    const updatedUserDoc = await userRef.get();
    const updatedUser = { id: updatedUserDoc.id, ...updatedUserDoc.data() };
    const { password: _, ...userWithoutPassword } = updatedUser;

    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor al actualizar usuario.' });
  }
};

// @desc    Eliminar un usuario
// @route   DELETE /api/users/:id
// @access  Admin
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const userRef = db.collection('usuarios').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    await userRef.delete();
    res.status(204).send(); // 204 No Content para eliminación exitosa
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor al eliminar usuario.' });
  }
}; 