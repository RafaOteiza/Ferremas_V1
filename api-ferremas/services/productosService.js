const { db } = require('./firebase');
const collection = db.collection('productos');

// 🧠 Generar prefijo a partir de la categoría
function obtenerPrefijoCategoria(categoria) {
  const mapa = {
    "Herramientas Electricas": "HE",
    "Herramientas Manuales": "HM",
    "Accesorios": "AC"
  };
  return mapa[categoria] || "XX";
}

// 📥 Obtener todos los productos
exports.getAll = async () => {
  const snapshot = await collection.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// 🔍 Obtener producto por ID
exports.getById = async (id) => {
  const doc = await collection.doc(id).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
};

// ➕ Crear nuevo producto con ID personalizado
exports.create = async (data) => {
  const prefix = obtenerPrefijoCategoria(data.categoria);

  // Buscar productos con el mismo prefijo
  const snapshot = await collection
    .where('id', '>=', `${prefix}0000`)
    .where('id', '<', `${prefix}9999`)
    .get();

  // Obtener máximo número actual
  const numeros = snapshot.docs.map(doc => {
    const match = doc.id.match(/\d+$/);
    return match ? parseInt(match[0], 10) : 0;
  });

  const maxNumero = numeros.length > 0 ? Math.max(...numeros) : 0;
  const nuevoNumero = String(maxNumero + 1).padStart(4, '0');
  const nuevoId = `${prefix}${nuevoNumero}`;

  const docRef = collection.doc(nuevoId);
  const existente = await docRef.get();

  if (existente.exists) {
    throw new Error(`El producto con ID ${nuevoId} ya existe`);
  }

  await docRef.set(data);
  const newDoc = await docRef.get();
  return { id: newDoc.id, ...newDoc.data() };
};

// 🔄 Actualizar producto
exports.update = async (id, data) => {
  const docRef = collection.doc(id);
  const doc = await docRef.get();

  if (!doc.exists) {
    throw new Error(`Producto con ID ${id} no encontrado`);
  }

  await docRef.update(data);
  const updatedDoc = await docRef.get();
  return { id: updatedDoc.id, ...updatedDoc.data() };
};

// ❌ Eliminar producto
exports.remove = async (id) => {
  await collection.doc(id).delete();
};
