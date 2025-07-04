const { db } = require('./firebase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prefixMap = {
  cliente: 'User_',
  admin: 'Admin_',
  bodeguero: 'Bod_',
  contador: 'Con_'
};

// Helper function to generate incremental ID (simplified for client role)
async function generarIdIncremental(rol) { // Mantiene el parámetro 'rol' por compatibilidad, pero lo ignora para la generación de ID
  const prefix = 'User_'; // Usa exclusivamente el prefijo 'User_' según las instrucciones
  const usersCollection = db.collection('usuarios');

  // Obtener todos los documentos en la colección para filtrar en el cliente
  // Esto evita la necesidad de índices compuestos específicos para esta consulta de ID.
  const snapshot = await usersCollection.get();

  let maxNumber = 0;
  snapshot.docs.forEach(doc => {
    const docId = doc.id;
    // Solo consideramos IDs que comienzan con el prefijo 'User_'
    if (docId.startsWith(prefix)) {
      const numberPart = docId.replace(prefix, '');
      const currentNumber = parseInt(numberPart, 10);
      if (!isNaN(currentNumber) && currentNumber > maxNumber) {
        maxNumber = currentNumber;
      }
    }
  });

  const nextNumber = maxNumber + 1;
  return `${prefix}${String(nextNumber).padStart(3, '0')}`;
}

// Buscar por correo
exports.buscarPorCorreo = async (correo) => {
  const usuariosRef = db.collection('usuarios');
  const snapshot = await usuariosRef.where('correo', '==', correo).get();
  return snapshot.empty ? null : snapshot.docs[0];
};

// Registro con rol
exports.registrar = async ({ nombre, correo, password, rol = 'cliente' }) => {
  const usuariosRef = db.collection('usuarios');

  // Check if user with this email already exists
  const existingUser = await exports.buscarPorCorreo(correo); // Use exports.buscarPorCorreo
  if (existingUser) {
    throw new Error('El correo ya está registrado.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const nuevoId = await generarIdIncremental(rol); // Generate custom ID

  const usuarioData = {
    nombre,
    correo,
    password: hashedPassword,
    rol,
    creado_en: new Date().toISOString() // Add creation timestamp
  };

  await usuariosRef.doc(nuevoId).set(usuarioData); // Set document with custom ID

  // Return the created user's data
  return { id: nuevoId, nombre, correo, rol };
};

// Login
exports.login = async ({ correo, password }) => {
  const userDoc = await this.buscarPorCorreo(correo);
  console.log('DEBUG: Resultado de buscarPorCorreo:', userDoc ? userDoc.id : 'No encontrado');
  if (!userDoc) throw new Error('Credenciales inválidas');

  const user = userDoc.data();
  console.log('DEBUG: Contraseña hasheada de la base de datos:', user.password);
  console.log('DEBUG: Contraseña recibida (sin hashear, no mostrar en producción):', password);
  const match = await bcrypt.compare(password, user.password);
  console.log('DEBUG: Resultado de bcrypt.compare:', match);
  if (!match) throw new Error('Credenciales inválidas');

  const token = jwt.sign(
    {
      id: userDoc.id,
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  console.log("🔐 Token generado:", token);

  console.log("✅ Objeto retornado por login:", { token });
  return { token };
};

// Perfil
exports.obtenerPerfil = async (id) => {
  const usuariosRef = db.collection('usuarios');
  const doc = await usuariosRef.doc(id).get();
  if (!doc.exists) return null;
  const data = doc.data();
  delete data.password;
  return { id: doc.id, ...data };
};

// Cambiar contraseña
exports.cambiarPassword = async (userId, passwordActual, passwordNueva) => {
  const usuariosRef = db.collection('usuarios');
  // 1. Buscar usuario por userId
  const userRef = usuariosRef.doc(userId);
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
