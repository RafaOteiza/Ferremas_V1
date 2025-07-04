const { db } = require('./firebase');

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
  const collection = db.collection('productos');
  const snapshot = await collection.get();
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      precio: Array.isArray(data.precio) ? data.precio : [data.precio],
      fechaCreacion: data.fechaCreacion || new Date().toISOString(),
      valor: data.valor || data.precio
    };
  });
};

// 🔍 Obtener producto por ID
exports.getById = async (id) => {
  const collection = db.collection('productos');
  const doc = await collection.doc(id).get();
  if (!doc.exists) return null;
  
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    precio: Array.isArray(data.precio) ? data.precio : [data.precio],
    fechaCreacion: data.fechaCreacion || new Date().toISOString(),
    valor: data.valor || data.precio
  };
};

// ➕ Crear nuevo producto con ID personalizado
exports.create = async (data) => {
  const collection = db.collection('productos');
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

  // Preparar datos con los campos requeridos
  const productoData = {
    ...data,
    precio: Array.isArray(data.precio) ? data.precio : [data.precio],
    fechaCreacion: new Date().toISOString(),
    valor: data.valor || data.precio
  };

  await docRef.set(productoData);
  const newDoc = await docRef.get();
  return { id: newDoc.id, ...newDoc.data() };
};

// 🔄 Actualizar producto
exports.update = async (id, data) => {
  const collection = db.collection('productos');
  const docRef = collection.doc(id);
  const doc = await docRef.get();

  if (!doc.exists) {
    throw new Error(`Producto con ID ${id} no encontrado`);
  }

  // Preparar datos con los campos requeridos
  const productoData = {
    ...data,
    precio: Array.isArray(data.precio) ? data.precio : [data.precio],
    valor: data.valor || data.precio
  };

  await docRef.update(productoData);
  const updatedDoc = await docRef.get();
  return { id: updatedDoc.id, ...updatedDoc.data() };
};

// ❌ Eliminar producto
exports.remove = async (id) => {
  const collection = db.collection('productos');
  const docRef = collection.doc(id);
  const doc = await docRef.get();
  
  if (!doc.exists) {
    throw new Error(`Producto con ID ${id} no encontrado`);
  }
  
  await docRef.delete();
  return { success: true };
};
