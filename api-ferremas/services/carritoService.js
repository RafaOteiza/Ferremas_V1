const { db } = require('./firebase');

exports.get = async (userId) => {
  const carritoRef = db.collection('carritoTemporal').doc(userId);
  const doc = await carritoRef.get();
  let items = [];
  if (doc.exists && doc.data()) {
    const data = doc.data();
    if (Array.isArray(data.items)) {
      items = data.items.filter(item => item && typeof item === 'object' && item.id);
    }
  }
  return items;
};

exports.add = async (userId, producto) => {
  // Validar que el producto sea un objeto válido
  if (producto === undefined || producto === null || typeof producto !== 'object') {
    throw new Error('Datos de producto inválidos: El producto es nulo o no es un objeto.');
  }

  // Validar propiedades del producto
  const { id, nombre, precio, cantidad } = producto;

  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error('ID de producto requerido y debe ser una cadena no vacía.');
  }
  if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
    throw new Error('Nombre de producto requerido y debe ser una cadena no vacía.');
  }
  if (typeof precio !== 'number' || isNaN(precio) || precio <= 0) {
    throw new Error('Precio de producto requerido y debe ser un número positivo válido.');
  }
  if (typeof cantidad !== 'number' || isNaN(cantidad) || cantidad <= 0) {
    throw new Error('Cantidad de producto requerida y debe ser un número entero positivo válido.');
  }

  // Validar stock disponible
  const productoRef = db.collection('productos').doc(id); 
  const productoDoc = await productoRef.get();
  if (!productoDoc.exists) throw new Error('Producto no encontrado en stock.');

  const productoData = productoDoc.data();
  if (!productoData) {
    throw new Error('Datos de producto incompletos en stock: no se encontró información de stock.');
  }
  const stockDisponible = productoData.stock || 0;

  // Obtener cantidad actual en carrito
  const carritoRef = db.collection('carritoTemporal').doc(userId);
  const doc = await carritoRef.get();
  let items = [];
  if (doc.exists && doc.data()) {
    const data = doc.data();
    if (Array.isArray(data.items)) {
      items = data.items.filter(item => item && typeof item === 'object' && item.id);
    }
  }

  const existente = items.find(item => item.id === id);
  const cantidadEnCarrito = existente ? existente.cantidad : 0;
  const nuevaCantidadTotal = cantidadEnCarrito + cantidad;

  // Validar stock suficiente
  if (nuevaCantidadTotal > stockDisponible) {
    throw new Error('No hay stock suficiente para este producto');
  }

  // Actualizar carrito
  if (!doc.exists) {
    await carritoRef.set({ items: [producto] });
    return [producto];
  }

  if (existente) {
    existente.cantidad += cantidad;
  } else {
    items.push(producto);
  }

  await carritoRef.update({ items });
  return items;
};

exports.remove = async (userId, productoId) => {
  const carritoRef = db.collection('carritoTemporal').doc(userId);
  const doc = await carritoRef.get();
  
  if (!doc.exists) return [];

  let items = [];
  if (doc.data() && Array.isArray(doc.data().items)) {
    items = doc.data().items.filter(item => item && typeof item === 'object' && item.id);
  }
  const nuevosItems = items.filter(item => item.id !== productoId);
  
  await carritoRef.update({ items: nuevosItems });
  return nuevosItems;
};

exports.finalize = async (userId, tipoEntrega) => {
  const carritoRef = db.collection('carritoTemporal').doc(userId);
  const doc = await carritoRef.get();
  
  if (!doc.exists) return null;

  let items = [];
  if (doc.data() && Array.isArray(doc.data().items)) {
    items = doc.data().items.filter(item => item && typeof item === 'object' && item.id);
  }
  if (items.length === 0) return null;

  // Obtener datos completos del usuario
  const userRef = db.collection('usuarios').doc(userId);
  const userDoc = await userRef.get();
  if (!userDoc.exists) {
    throw new Error('Usuario no encontrado.');
  }
  const userData = userDoc.data();
  const usuarioInfo = {
    id: userId,
    nombre: userData.nombre,
    correo: userData.correo,
  };

  // Enriquecer datos de productos y verificar stock
  const enrichedItems = [];
  const batch = db.batch();

  for (const item of items) {
    const productoRef = db.collection('productos').doc(item.id);
    const productoDoc = await productoRef.get();

    if (!productoDoc.exists) {
      throw new Error(`El producto ${item.nombre} no existe en el catálogo`);
    }

    const productoData = productoDoc.data();
    if (!productoData || typeof productoData.stock !== 'number') {
      throw new Error(`Datos de stock inválidos para el producto ${item.nombre}`);
    }

    if (productoData.stock < item.cantidad) {
      throw new Error(`No hay stock suficiente para el producto ${item.nombre}`);
    }

    // Actualizar el stock del producto
    batch.update(productoRef, {
      stock: productoData.stock - item.cantidad
    });

    // Enriquecer producto con categoría y marca
    enrichedItems.push({
      id: item.id,
      nombre: productoData.nombre,
      precio: productoData.precio,
      cantidad: item.cantidad,
      categoria: productoData.categoria || 'Desconocida',
      marca: productoData.marca || 'Desconocida',
    });
  }

  // Definir el estado del pedido basado en el tipo de entrega
  let estadoPedido = 'pendiente';
  if (tipoEntrega === 'despacho') {
    estadoPedido = 'Pendiente por Despacho';
  } else if (tipoEntrega === 'retiro_local') {
    estadoPedido = 'Pendiente por Retiro';
  }

  // Generar el ID secuencial del pedido
  const pedidoId = await _getNextOrderId(tipoEntrega);

  const pedido = {
    id: pedidoId, // Asignar el ID generado
    items: enrichedItems,
    estado: estadoPedido,
    fecha: new Date().toISOString(),
    usuario: usuarioInfo,
    tipoEntrega: tipoEntrega
  };

  // Agregar operaciones al batch
  batch.set(db.collection('pedidos').doc(pedidoId), pedido); // Usar el ID generado aquí
  batch.delete(carritoRef);

  // Ejecutar todas las operaciones de manera atómica
  await batch.commit();

  return { id: pedidoId, ...pedido };
};

exports.vaciar = async (userId) => {
  const carritoRef = db.collection('carritoTemporal').doc(userId);
  const doc = await carritoRef.get();
  
  if (!doc.exists) return [];

  await carritoRef.delete();
  return [];
};

exports.updateQuantity = async (userId, productId, newQuantity) => {
  const carritoRef = db.collection('carritoTemporal').doc(userId);
  const doc = await carritoRef.get();

  if (!doc.exists) {
    throw new Error('El carrito no existe.');
  }

  let items = [];
  if (doc.data() && Array.isArray(doc.data().items)) {
    items = doc.data().items.filter(item => item && typeof item === 'object' && item.id);
  }

  const itemIndex = items.findIndex(item => item.id === productId);

  if (itemIndex === -1) {
    throw new Error('El producto no se encuentra en el carrito.');
  }

  // Validar stock disponible antes de actualizar
  const productoRef = db.collection('productos').doc(productId);
  const productoDoc = await productoRef.get();

  if (!productoDoc.exists) {
    throw new Error(`El producto ${productId} no existe en el catálogo.`);
  }

  const productoData = productoDoc.data();
  if (!productoData || typeof productoData.stock !== 'number') {
    throw new Error(`Datos de stock inválidos para el producto ${productoData ? productoData.nombre : productId}.`);
  }

  if (newQuantity > productoData.stock) {
    throw new Error(`No hay stock suficiente para el producto ${productoData.nombre}. Stock disponible: ${productoData.stock}, solicitado: ${newQuantity}`);
  }

  // Actualizar la cantidad del producto en el carrito
  items[itemIndex].cantidad = newQuantity;

  await carritoRef.update({ items });
  return items;
};

// Función auxiliar para obtener el siguiente ID secuencial de pedido
async function _getNextOrderId(tipoEntrega) {
  let prefix = '';
  if (tipoEntrega === 'despacho') {
    prefix = 'DES_';
  } else if (tipoEntrega === 'retiro_local') {
    prefix = 'RET_';
  } else {
    throw new Error('Tipo de entrega no válido para generar ID.');
  }

  const lastOrderQuery = await db.collection('pedidos')
    .where('id', '>=', prefix)
    .where('id', '<=', prefix + '\uf8ff') // Busca IDs que empiecen con el prefijo
    .orderBy('id', 'desc')
    .limit(1)
    .get();

  let nextNumber = 1;
  if (!lastOrderQuery.empty) {
    const lastOrderId = lastOrderQuery.docs[0].id;
    const lastNumber = parseInt(lastOrderId.replace(prefix, ''), 10);
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }
  return `${prefix}${String(nextNumber).padStart(4, '0')}`;
};
