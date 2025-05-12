const { db } = require('./firebase');
const carritoRef = db.collection('carritoTemporal').doc('cliente');

exports.get = async () => {
  const doc = await carritoRef.get();
  return doc.exists ? doc.data() : { items: [] };
};

exports.add = async ({ id, nombre, precio, cantidad }) => {
  const doc = await carritoRef.get();
  const data = doc.exists ? doc.data() : { items: [] };

  const index = data.items.findIndex(p => p.id === id);
  if (index !== -1) {
    data.items[index].cantidad += cantidad;
  } else {
    data.items.push({ id, nombre, precio, cantidad });
  }

  await carritoRef.set(data);
  return data;
};

exports.remove = async (id) => {
  const doc = await carritoRef.get();
  if (!doc.exists) return { items: [] };

  const data = doc.data();
  data.items = data.items.filter(p => p.id !== id);

  await carritoRef.set(data);
  return data;
};

exports.finalize = async () => {
  const doc = await carritoRef.get();
  if (!doc.exists || !doc.data().items.length) {
    throw new Error('Carrito vacío');
  }

  const pedido = {
    items: doc.data().items,
    fecha: new Date().toISOString()
  };

  await db.collection('pedidos').add(pedido);
  await carritoRef.set({ items: [] });

  return pedido;
};
