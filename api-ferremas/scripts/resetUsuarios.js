const { db } = require('../services/firebase');
const bcrypt = require('bcryptjs');

const usuarios = [
  {
    nombre: 'Rafael Oteiza',
    correo: 'ra.oteiza@gmail.com',
    password: 'Knotfest.11',
    rol: 'admin'
  },
  {
    nombre: 'Matias Garrido',
    correo: 'mat.garrido@duocuc.cl',
    password: 'Knotfest.11',
    rol: 'cliente'
  },
  {
    nombre: 'Luis Arenas',
    correo: 'luis.arenas@duocuc.cl',
    password: 'Knotfest.11',
    rol: 'cliente'
  },
  {
    nombre: 'Mario Veas',
    correo: 'mario.veas@ferremas.cl',
    password: 'Knotfest.11',
    rol: 'bodeguero'
  },
  {
    nombre: 'Mario Jimenez',
    correo: 'mario.jimenez@ferremas.cl',
    password: 'Knotfest.11',
    rol: 'contador'
  },
  {
    nombre: 'Juan Perez',
    correo: 'juan.perez@ferremas.cl',
    password: 'Knotfest.11',
    rol: 'vendedor'
  }
];

// Mapa de prefijos
const prefixMap = {
  cliente: 'User_',
  admin: 'Admin_',
  bodeguero: 'Bod_',
  contador: 'Con_',
  vendedor: 'Ven_'
};

const run = async () => {
  try {
    console.log('🚨 Eliminando usuarios existentes...');
    const snapshot = await db.collection('usuarios').get();
    const batch = db.batch();
    snapshot.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    console.log('✅ Todos los usuarios eliminados.');

    const usuariosRef = db.collection('usuarios');
    const conteo = {};

    for (const u of usuarios) {
      const prefix = prefixMap[u.rol] || 'User_';
      conteo[prefix] = (conteo[prefix] || 0) + 1;
      const numero = String(conteo[prefix]).padStart(3, '0');
      const id = `${prefix}${numero}`;

      const passwordHasheada = await bcrypt.hash(u.password, 10);

      await usuariosRef.doc(id).set({
        nombre: u.nombre,
        correo: u.correo,
        password: passwordHasheada,
        rol: u.rol,
        creado_en: new Date()
      });

      console.log(`🆕 Usuario creado: ${id} (${u.correo})`);
    }

    console.log('🎉 Usuarios recreados exitosamente.');
  } catch (error) {
    console.error('❌ Error al resetear usuarios:', error);
  }
};

run();
